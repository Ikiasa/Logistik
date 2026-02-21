import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { Pool } from "pg";
import { Money } from "../common/domain/money";

@Injectable()
export class FinancialService {
  private readonly logger = new Logger(FinancialService.name);

  constructor(private readonly db: Pool) {}

  /**
   * Adds a financial adjustment to an Order.
   * Enforces:
   * 1. Append-Only Ledger (No direct mutation of Order totals)
   * 2. Idempotency via unique adjustment ID
   * 3. Money Value Object usage
   */
  async addAdjustment(
    orderId: string,
    adjustmentAmount: Money,
    reason: string,
    userId: string,
    adjustmentId: string, // Used as Idempotency Key
  ): Promise<void> {
    const client = await this.db.connect();
    try {
      // No Transaction needed for single insert if auto-commit,
      // but explicit Tx is safer for future expansion (e.g. read-then-write logic)
      await client.query("BEGIN");

      // 1. Validate Order Exists (Optional, FK handles it but nice for error msg)
      // 2. Insert Adjustment
      // Uses STRICT BigInt mapping from Money object
      await client.query(
        `
                INSERT INTO order_adjustments (
                    id, order_id, adjustment_amount, adjustment_currency, reason, authorized_by, created_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, NOW()
                )
            `,
        [
          adjustmentId,
          orderId,
          adjustmentAmount.amount, // Maps to BIGINT
          adjustmentAmount.currency,
          reason,
          userId,
        ],
      );

      await client.query("COMMIT");
      this.logger.log(
        `Financial Adjustment added: ${adjustmentId} for Order ${orderId}`,
      );
    } catch (err) {
      await client.query("ROLLBACK");

      // Handle Idempotency / PK Violation
      if (err.code === "23505") {
        // Unique violation
        this.logger.warn(`Idempotent skip for adjustment ${adjustmentId}`);
        throw new ConflictException(
          `Adjustment ${adjustmentId} already exists`,
        );
      }
      if (err.code === "23503") {
        // FK violation
        throw new NotFoundException(`Order ${orderId} not found`);
      }

      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Retrieves the Net Financial State of an Order.
   * Reconciles: Base Total + Sum(Adjustments)
   */
  async getNetOrderTotal(orderId: string): Promise<Money> {
    const client = await this.db.connect();
    try {
      // 1. Fetch Base Order Total
      const orderRes = await client.query(
        `
                SELECT total_amount, total_currency 
                FROM orders 
                WHERE id = $1
            `,
        [orderId],
      );

      if (orderRes.rows.length === 0)
        throw new NotFoundException("Order not found");

      const baseRow = orderRes.rows[0];
      // Handle case where total might be NULL (dirty data) or 0
      const baseTotal = Money.from(
        baseRow.total_amount || 0n,
        baseRow.total_currency || "USD",
      );

      // 2. Fetch Adjustments Sum
      const adjRes = await client.query(
        `
                SELECT SUM(adjustment_amount) as total_adj, adjustment_currency
                FROM order_adjustments
                WHERE order_id = $1
                GROUP BY adjustment_currency
            `,
        [orderId],
      );

      let netTotal = baseTotal;

      if (adjRes.rows.length > 0) {
        for (const row of adjRes.rows) {
          const adjMoney = Money.from(row.total_adj, row.adjustment_currency);

          // Domain Guard: Will throw if currency mismatch
          // In a real multi-currency system, we'd conversion here.
          // For now, we enforce single currency per order lifecycle.
          netTotal = netTotal.add(adjMoney);
        }
      }

      return netTotal;
    } finally {
      client.release();
    }
  }
}
