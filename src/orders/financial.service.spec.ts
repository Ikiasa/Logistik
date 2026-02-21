import { Test, TestingModule } from "@nestjs/testing";
import { FinancialService } from "./financial.service";
import { Pool } from "pg";
import { Money } from "../common/domain/money";
import { v4 as uuidv4 } from "uuid";
import { ConflictException } from "@nestjs/common";

// Mock PG Client
const mockQuery = jest.fn();
const mockClient = {
  query: mockQuery,
  release: jest.fn(),
};
const mockPool = {
  connect: jest.fn().mockResolvedValue(mockClient),
};

describe("FinancialService", () => {
  let service: FinancialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinancialService, { provide: Pool, useValue: mockPool }],
    }).compile();

    service = module.get<FinancialService>(FinancialService);
    jest.clearAllMocks();
  });

  describe("addAdjustment", () => {
    it("should insert adjustment into ledger correctly", async () => {
      const orderId = uuidv4();
      const adjId = uuidv4();
      const amount = Money.from(500, "USD");

      mockQuery.mockResolvedValueOnce({}); // BEGIN
      mockQuery.mockResolvedValueOnce({ rowCount: 1 }); // INSERT
      mockQuery.mockResolvedValueOnce({}); // COMMIT

      await service.addAdjustment(orderId, amount, "Credit", "user-1", adjId);

      expect(mockQuery).toHaveBeenCalledWith("BEGIN");
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO order_adjustments"),
        [adjId, orderId, 500n, "USD", "Credit", "user-1"],
      );
      expect(mockQuery).toHaveBeenCalledWith("COMMIT");
    });

    it("should handle idempotency (duplicate ID) gracefully", async () => {
      const orderId = uuidv4();
      const adjId = uuidv4();
      const amount = Money.from(500, "USD");

      mockQuery.mockResolvedValueOnce({}); // BEGIN
      mockQuery.mockRejectedValueOnce({ code: "23505" }); // Unique Constraint Violation
      mockQuery.mockResolvedValueOnce({}); // ROLLBACK

      await expect(
        service.addAdjustment(orderId, amount, "Credit", "user-1", adjId),
      ).rejects.toThrow(ConflictException);

      expect(mockQuery).toHaveBeenCalledWith("ROLLBACK");
    });
  });

  describe("getNetOrderTotal", () => {
    it("should calculate net total from base + adjustments", async () => {
      const orderId = uuidv4();

      // Mock Base Order
      mockQuery.mockResolvedValueOnce({
        rows: [{ total_amount: 1000n, total_currency: "USD" }],
      });

      // Mock Adjustments (Sum)
      mockQuery.mockResolvedValueOnce({
        rows: [{ total_adj: -200n, adjustment_currency: "USD" }],
      });

      const result = await service.getNetOrderTotal(orderId);

      // 1000 - 200 = 800
      expect(result.amount).toBe(800n);
      expect(result.currency).toBe("USD");
    });

    it("should throw mismatch error if adjustment currency differs", async () => {
      const orderId = uuidv4();

      mockQuery.mockResolvedValueOnce({
        rows: [{ total_amount: 1000n, total_currency: "USD" }],
      });

      mockQuery.mockResolvedValueOnce({
        rows: [{ total_adj: 50n, adjustment_currency: "EUR" }],
      });

      await expect(service.getNetOrderTotal(orderId)).rejects.toThrow(
        "Currency mismatch",
      );
    });
  });
});
