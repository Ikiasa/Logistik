import { Test, TestingModule } from "@nestjs/testing";
import { OutboxService } from "./outbox.service";
import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";

// Mock Client & Pool
const mockQuery = jest.fn();
const mockClient = {
  query: mockQuery,
  release: jest.fn(),
};
const mockPool = {
  connect: jest.fn().mockResolvedValue(mockClient),
};

describe("OutboxService", () => {
  let service: OutboxService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [OutboxService, { provide: Pool, useValue: mockPool }],
    }).compile();

    service = module.get<OutboxService>(OutboxService);
  });

  describe("emit", () => {
    it("should insert event used active client", async () => {
      const event = {
        aggregate_type: "Order",
        aggregate_id: uuidv4(),
        event_type: "OrderCreated",
        payload: { foo: "bar" },
      };

      mockQuery.mockResolvedValueOnce({}); // INSERT

      await service.emit(mockClient, event);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO outbox_events"),
        [
          expect.any(String), // UUID
          "Order",
          event.aggregate_id,
          "OrderCreated",
          JSON.stringify(event.payload),
        ],
      );
    });
  });

  describe("processBatch", () => {
    it("should fetch locked events and mark processed on success", async () => {
      const eventId = uuidv4();
      const events = [{ id: eventId, event_type: "Test" }];

      // Sequence:
      // 1. BEGIN
      // 2. SELECT ... SKIP LOCKED
      // 3. UPDATE (Success)
      // 4. COMMIT
      mockQuery.mockResolvedValueOnce({}); // BEGIN
      mockQuery.mockResolvedValueOnce({ rows: events }); // SELECT
      mockQuery.mockResolvedValueOnce({}); // UPDATE Success
      mockQuery.mockResolvedValueOnce({}); // COMMIT

      const handler = jest.fn().mockResolvedValue([eventId]);

      const count = await service.processBatch(10, handler);

      expect(count).toBe(1);
      expect(handler).toHaveBeenCalledWith(events);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining(
          "UPDATE outbox_events SET status = 'PUBLISHED'",
        ),
        expect.anything(),
      );
    });

    it("should handle failures with backoff", async () => {
      const eventId = uuidv4();
      const events = [{ id: eventId, event_type: "FailMe" }];

      mockQuery.mockResolvedValueOnce({}); // BEGIN
      mockQuery.mockResolvedValueOnce({ rows: events }); // SELECT
      mockQuery.mockResolvedValueOnce({}); // UPDATE Fail check 1 (Backoff)
      mockQuery.mockResolvedValueOnce({}); // UPDATE Fail check 2 (DLQ)
      mockQuery.mockResolvedValueOnce({}); // COMMIT

      const handler = jest.fn().mockResolvedValue([]); // Return empty success list

      await service.processBatch(10, handler);

      // Expect update to PENDING with backoff math
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("SET status = 'PENDING'"),
        expect.anything(),
      );
    });
  });
});
