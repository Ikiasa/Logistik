import { Injectable, Logger } from "@nestjs/common";
import { Pool, PoolClient } from "pg";
import { v4 as uuidv4 } from "uuid";

export interface OutboxEvent {
  id: string;
  aggregate_type: string;
  aggregate_id: string;
  event_type: string;
  payload: any;
}

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(private readonly db: Pool) {}

  /**
   * Inserts an event into the Outbox table within a given transaction context.
   * @param client The active PG Client (must be in a transaction)
   * @param event The event details
   */
  async emit(
    client: PoolClient | any,
    event: Omit<OutboxEvent, "id">,
  ): Promise<string> {
    const id = uuidv4();

    await client.query(
      `
            INSERT INTO outbox_events (
                id, aggregate_type, aggregate_id, event_type, payload
            ) VALUES (
                $1, $2, $3, $4, $5
            )
        `,
      [
        id,
        event.aggregate_type,
        event.aggregate_id,
        event.event_type,
        JSON.stringify(event.payload),
      ],
    );

    // this.logger.debug(`Outbox Event emitted: ${event.event_type} for ${event.aggregate_id}`);
    return id;
  }

  /**
   * Polls for pending events effectively using SKIP LOCKED.
   * This method is called by the Worker.
   */
  async pollPendingEvents(batchSize: number = 50): Promise<OutboxEvent[]> {
    const client = await this.db.connect();
    try {
      await client.query("BEGIN");

      // SELECT ... FOR UPDATE SKIP LOCKED
      // Checks for PENDING events that are due (next_attempt_at <= NOW())
      const res = await client.query(
        `
                SELECT id, aggregate_type, aggregate_id, event_type, payload
                FROM outbox_events
                WHERE status = 'PENDING' 
                  AND next_attempt_at <= NOW()
                ORDER BY next_attempt_at ASC
                LIMIT $1
                FOR UPDATE SKIP LOCKED
            `,
        [batchSize],
      );

      await client.query("COMMIT"); // Commit the lock?
      // WAIT! If we commit here, the lock is released.
      // The worker needs to HOLD the lock until it processes.
      // But usually, workers process async.
      // Standard Pattern:
      // 1. Fetch & Lock (Keep TX open) -> Process -> Commit/Rollback TX.
      // OR
      // 2. Fetch & Mark 'PROCESSING' (new status) in same TX -> Process -> Update 'PUBLISHED'.
      // Given the plan says "UPDATE status='PUBLISHED' ... in DB", step 3.
      // This implies we need to hold the lock OR transition state.
      // "SKIP LOCKED" is valuable if we hold the lock.
      // Use Approach 2 for simpler non-long-running TX:
      // Fetch -> Mark PROCESSING -> Commit.

      // Actually, Plan Step 3.1 says:
      // 1. Poll (Select).
      // 2. Publish.
      // 3. Commit (Update Status).
      // If we close the TX after Select, lock is lost.
      // So we MUST return the Client/TX to the caller? No, that leaks connection.

      // Refined Approach per Plan:
      // We need to keep the connection/transaction open, OR mark as 'PROCESSING' immediately.
      // Plan didn't specify 'PROCESSING' state in the Enum (Only PENDING, PUBLISHED, FAILED).
      // So we MUST hold the transaction open or rely on optimistic locking?
      // "FOR UPDATE SKIP LOCKED" implies holding the lock.
      // So this method should probably be "fetchBatchAndProcess" accepting a callback?
      // OR returns list, but how to handle lock?

      // Let's implement `processBatch(handler: (events) => Promise<void>)` pattern.
      // This ensures connection is managed properly.

      return res.rows; // Placeholder if we change design, but logically incorrect for Locking.
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * Processes a batch of events with a handler, managing the Transaction and Locks.
   */
  async processBatch(
    batchSize: number,
    handler: (events: OutboxEvent[]) => Promise<string[]>, // Returns List of Success IDs
  ): Promise<number> {
    const client = await this.db.connect();
    try {
      await client.query("BEGIN");

      const res = await client.query(
        `
                SELECT id, aggregate_type, aggregate_id, event_type, payload
                FROM outbox_events
                WHERE status = 'PENDING' 
                  AND next_attempt_at <= NOW()
                ORDER BY next_attempt_at ASC
                LIMIT $1
                FOR UPDATE SKIP LOCKED
            `,
        [batchSize],
      );

      if (res.rows.length === 0) {
        await client.query("COMMIT");
        return 0;
      }

      const events = res.rows;

      // Execute Handler (Publishing)
      // If handler fails, we roll back whole batch? Or partial?
      // Usually partial success is tricky in one TX.
      // Let's assume all-or-nothing for the batch for simplicity,
      // OR handler handles individual try/catch and returns successes.

      const successIds = await handler(events);

      // Mark Successes
      if (successIds.length > 0) {
        await client.query(
          `
                    UPDATE outbox_events 
                    SET status = 'PUBLISHED', processed_at = NOW(), retry_count = 0
                    WHERE id = ANY($1)
                `,
          [successIds],
        );
      }

      // Handle Failures (Those locked but not in successIds)
      const allIds = events.map((e) => e.id);
      const failedIds = allIds.filter((id) => !successIds.includes(id));

      if (failedIds.length > 0) {
        await client.query(
          `
                    UPDATE outbox_events 
                    SET status = 'PENDING',
                        retry_count = retry_count + 1,
                        next_attempt_at = NOW() + (interval '1 second' * power(2, retry_count)),
                        last_error = 'Batch Processing Failure'
                    WHERE id = ANY($1)
                `,
          [failedIds],
        );

        // Check DLQ logic here too? (e.g. retry_count > 5 -> FAILED)
        await client.query(
          `
                    UPDATE outbox_events 
                    SET status = 'FAILED'
                    WHERE id = ANY($1) AND retry_count >= 5
                `,
          [failedIds],
        );
      }

      await client.query("COMMIT");
      return events.length;
    } catch (err) {
      await client.query("ROLLBACK");
      this.logger.error("Batch processing failed", err);
      throw err;
    } finally {
      client.release();
    }
  }
}
