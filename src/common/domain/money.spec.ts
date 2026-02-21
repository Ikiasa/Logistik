import { Money, CurrencyMismatchError } from "./money";

describe("Money Value Object", () => {
  // 1. Immutability & Creation
  test("should create instance with BigInt amount", () => {
    const m = Money.from(1000, "USD");
    expect(m.amount).toBe(1000n);
    expect(m.currency).toBe("USD");
  });

  test("should throw on invalid currency code", () => {
    expect(() => Money.from(100, "US")).toThrow("Invalid currency code");
  });

  test("should throw on float input", () => {
    expect(() => Money.from(10.5, "USD")).toThrow("integer");
  });

  // 2. Arithmetic
  test("should add same currency correctly", () => {
    const a = Money.from(100, "USD");
    const b = Money.from(50, "USD");
    const result = a.add(b);

    expect(result.amount).toBe(150n);
    expect(result).not.toBe(a); // Immutability check
  });

  test("should throw CurrencyMismatchError on add", () => {
    const a = Money.from(100, "USD");
    const b = Money.from(50, "EUR");
    expect(() => a.add(b)).toThrow(CurrencyMismatchError);
  });

  test("should subtract correctly", () => {
    const a = Money.from(100, "USD");
    const b = Money.from(30, "USD");
    expect(a.subtract(b).amount).toBe(70n);
  });

  // 3. Rounding (Banker's Rounding)
  test("multiply should use Bankers Rounding", () => {
    // 2.5 -> 2 (Round half to even)
    // 100 * 0.025 = 2.5
    const m = Money.from(100, "USD");
    expect(m.multiply(0.025).amount).toBe(2n);

    // 3.5 -> 4 (Round half to even)
    // 100 * 0.035 = 3.5
    const m2 = Money.from(100, "USD");
    expect(m2.multiply(0.035).amount).toBe(4n);

    // 2.6 -> 3
    expect(m.multiply(0.026).amount).toBe(3n);
  });

  // 4. Allocation (Penny Distribution)
  test("allocate should preserve total and distribute remainder", () => {
    const total = Money.from(100, "USD"); // 1.00 USD
    const parts = total.allocate([1, 1, 1]); // Split 3 ways

    // 100 / 3 = 33 r 1
    expect(parts[0].amount).toBe(34n); // Gets remainder
    expect(parts[1].amount).toBe(33n);
    expect(parts[2].amount).toBe(33n);

    const sum = parts.reduce((a, b) => a.add(b), Money.zero("USD"));
    expect(sum.amount).toBe(100n);
  });

  // 5. Comparison
  test("equals should return true for value equality", () => {
    const a = Money.from(100, "USD");
    const b = Money.from(100, "USD");
    expect(a.equals(b)).toBe(true);
    expect(a === b).toBe(false); // Reference inequality
  });
});
