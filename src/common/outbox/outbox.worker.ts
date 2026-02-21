import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from "@nestjs/common";
import { OutboxService, OutboxEvent } from "./outbox.service";

@Injectable()
export class OutboxWorker implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(OutboxWorker.name);
  private isRunning = false;
  private isShuttingDown = false;
  private timer: NodeJS.Timeout | null = null;

  // Configuration (In a real app, inject via ConfigService)
  private readonly POLLING_INTERVAL_MS = 200; // Low latency default
  private readonly BATCH_SIZE = 50;

  constructor(private readonly outboxService: OutboxService) {}

  onApplicationBootstrap() {
    this.logger.log("Starting Outbox Worker...");
    this.isRunning = true;
    this.scheduleNextPoll();
  }

  onModuleDestroy() {
    this.logger.log("Stopping Outbox Worker...");
    this.isShuttingDown = true;
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  private scheduleNextPoll() {
    if (this.isShuttingDown) return;

    this.timer = setTimeout(() => this.poll(), this.POLLING_INTERVAL_MS);
  }

  private async poll() {
    if (this.isShuttingDown) return;

    try {
      const processedCount = await this.outboxService.processBatch(
        this.BATCH_SIZE,
        this.publishBatch.bind(this),
      );

      if (processedCount > 0) {
        // If we found work, poll immediately again! (High Throughput Mode)
        this.scheduleNextPollImmediate();
        return;
      }
    } catch (err) {
      this.logger.error("Error in Outbox Polling Loop", err);
      // On error, back off normally to avoid tight loop failure spam
    }

    this.scheduleNextPoll();
  }

  private scheduleNextPollImmediate() {
    if (this.isShuttingDown) return;
    // Use setImmediate to yield I/O but run fast
    this.timer = setTimeout(() => this.poll(), 0);
  }

  /**
   * The actual "Publisher" logic.
   * In a real app, this would inject an EventBus (RabbitMQ/Kafka).
   * For now, we simulate success or log it.
   */
  private async publishBatch(events: OutboxEvent[]): Promise<string[]> {
    const successes: string[] = [];

    for (const event of events) {
      try {
        // Simulate Publishing
        // this.eventBus.publish(event);

        // Log for observability
        this.logger.log(
          `[Dispatch] Published ${event.event_type} (ID: ${event.id}) for Aggregate ${event.aggregate_id}`,
        );

        // Metrics Hook (Placeholder)
        // this.metrics.increment('outbox.published', { type: event.event_type });

        successes.push(event.id);
      } catch (error) {
        this.logger.error(`Failed to publish event ${event.id}`, error);
        // Metrics Hook
        // this.metrics.increment('outbox.failed', { type: event.event_type });

        // We do NOT add to successes, so it remains PENDING (or FAILED if retries exceeded)
      }
    }

    return successes;
  }
}
