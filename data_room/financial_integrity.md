# Implementation Plan - Financial Integrity (Money Pattern)

## Goal
To implement an enterprise-grade "Financial Integrity" module that guarantees precision, auditability, and legal compliance for all monetary values within the Logistics Management System. This eliminates floating-point errors, enforces strict currency isolation, and ensures immutable financial records.

## 1. Core Principles (The "Money" Pattern)

### 1.1. Money as a Value Object
-   **No Primitives:** Raw `number` or `float` types typically used for money are BANNED in the domain layer.
-   **Structure:** All monetary values will be encapsulated in a `Money` Value Object containing:
    -   `amount`: BigInt (Minor Units, e.g., cents).
    -   `currency`: String (ISO 4217, e.g., 'USD', 'EUR').
-   **Behavior:** The Value Object will expose methods for arithmetic (`add`, `subtract`, `allocate`) that strictly enforce currency matching and return new instances (immutability).

### 1.2. Storage Strategy
-   **Integer-Based Storage:** All values stored in the database as `BIGINT` representing minor units.
-   **Column Pattern:** Composite columns for every financial field:
    -   `price_amount` (BIGINT)
    -   `price_currency` (CHAR(3))
-   **No Floating Point:** The `decimal` or `numeric` types will be used ONLY for strictly defined ratios (e.g., tax rates, FX rates), never for monetary amounts.

### 1.4. Technical Specifications (Clarifications)

#### A. Money Value Object
-   **Immutability:** The `Money` class is strictly immutable. All operations (`add`, `subtract`, `multiply`) return a **new instance**.
    ```typescript
    class Money {
      readonly amount: bigint;
      readonly currency: string;
      add(other: Money): Money { ... } // Returns new Money
    }
    ```
-   **Encapsulation:** No public setters. Internal state is `readonly`.

#### B. Currency Enforcement
-   **Internal Guards:** The `Money` class explicitly checks currency on *every* check.
    -   `a.add(b)` throws `CurrencyMismatchError` if `a.currency !== b.currency`.
    -   Service layer validation is a fallback; Domain layer is the primary guard.

#### C. Database Enforcement
-   **Types:** `amount` is strictly `BIGINT`. `currency` is `CHAR(3)`.
-   **Constraints:**
    -   `CHECK (currency ~ '^[A-Z]{3}$')` to enforce ISO format.
    -   `CHECK (amount >= 0)` (unless specifically a credit field).
-   **Immutability Trigger:** Similar to Address module, a DB trigger will block updates to financial columns (`total_amount`, `total_currency`) once `status IN ('CONFIRMED', 'SHIPPED', 'DELIVERED')`.

#### D. Adjustment Model (Ledger)
-   **No Silent Mutation:** Updates to an Order's total after confirmation are BANNED.
-   **Ledger Table:** `order_adjustments` table tracks all changes.
    -   Columns: `order_id`, `adjustment_amount`, `adjustment_currency`, `reason`, `authorized_by`.
    -   Net Total = `orders.total_amount` + `SUM(order_adjustments.amount)`.

#### E. Rounding & Allocation
-   **Centralized Logic:** `Money` class owns the rounding logic.
-   **Penny Allocation:** The `allocate(ratios: number[])` method uses the **Largest Remainder Method** to ensure:
    -   Sum of parts == Total (Exact, no drift).
    -   Deterministic distribution of remainder.

## 2. Proposed Data Model Changes

### 2.1. Schema Updates (Conceptual)
Existing tables (`orders`, `order_items`) will be migrated from simple `numeric` columns to the composite pattern.

#### `order_items`
-   `unit_price` (numeric) -> `unit_price_amount` (BIGINT), `unit_price_currency` (CHAR(3))
-   `subtotal` (numeric) -> `subtotal_amount` (BIGINT), `subtotal_currency` (CHAR(3))
-   `tax` (numeric) -> `tax_amount` (BIGINT), `tax_currency` (CHAR(3))

#### `orders`
-   `total_price` (numeric) -> `total_amount` (BIGINT), `total_currency` (CHAR(3))

### 2.2. Tax & Fee Modeling
A dedicated JSONB structure will be used to store tax breakdowns to allow different jurisdiction rules without schema bloat, BUT the summary totals must be elevated to columns for querying.

-   `tax_breakdown` (JSONB):
    ```json
    [
      { "name": "VAT", "rate": "0.19", "amount": 1900, "currency": "EUR" },
      { "name": "Eco Tax", "rate": "0.00", "amount": 500, "currency": "EUR" }
    ]
    ```

## 3. Domain Logic & Safeguards

### 3.1. Immutability Rules
-   **Locked State:** Once an Order is `CONFIRMED`, all financial columns become read-only.
-   **Adjustments:** Any post-confirmation change must be modeled as a separate `Adjustment` or `CreditNote` entity linked to the Order. **No in-place mutation of history.**

### 3.2. Precision & Rounding
-   **Rounding Strategy:** "Banker's Rounding" (Partially even) will be the default to minimize accumulated drift, unless jurisdiction requires specific rules (e.g., Swiss Rounding to 0.05).
-   **Allocation:** When splitting amounts (e.g., discounts across items), the "Penny Allocation" algorithm will be used to ensure `sum(parts) === total`. Remainder pennies are distributed to the first items.

## 4. API Changes (v2)

### 4.1. DTOs
Input and Output DTOs will change to reflect the structure.
-   **Request:**
    ```json
    "price": {
      "amount": 1000, 
      "currency": "USD"
    }
    ```
-   **Response:** Same structure.
-   **Validation:** Strict validation that `amount` is an integer and `currency` is a valid ISO code.

## 5. Migration Strategy

This is a **Breaking Change** for the schema.
1.  **Dual Columns:** Add new `_amount` / `_currency` columns.
2.  **Backfill:** Script to convert existing `numeric` values to `BIGINT` (multiplying by 100 or 1000 depending on currency).
    -   *Risk:* Existing float errors might be baked in. Migration report will highlight rounding differences.
3.  **Code Swap:** Deploy code reading from new columns.
4.  **Drop Legacy:** Remove old `numeric` columns.

## 6. Verification Plan

### 6.1. Automated Tests
-   **Unit Tests:** Verify `Money` class logic (arithmetic, allocation, error throwing).
-   **Integration Tests:** Verify DB persistence and retrieval preserves exact integer values.
-   **Rounding Tests:** Feed datasets known to cause floating-point drift (e.g., 0.1 + 0.2) and assert correctness.

### 6.2. Manual Verification
-   **Audit Log Check:** Verify "Order Adjustment" flow creates new records instead of mutating.
