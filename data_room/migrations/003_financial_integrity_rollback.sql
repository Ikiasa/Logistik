-- Rollback: 003_financial_integrity_schema
-- Description: Reverts Money Pattern changes (Drops columns, tables, and triggers).
-- CAUTION: Data in new money columns will be LOST.

BEGIN;

-- 1. Drop Trigger and Function
DROP TRIGGER IF EXISTS trg_protect_financial_integrity ON orders;
DROP FUNCTION IF EXISTS protect_financial_integrity;

DROP TRIGGER IF EXISTS trg_protect_ledger_immutability ON order_adjustments;
DROP FUNCTION IF EXISTS protect_ledger_immutability;

-- 2. Drop Adjustments Ledger
DROP TABLE IF EXISTS order_adjustments;

-- 3. Drop Money Columns from order_items
ALTER TABLE order_items
    DROP COLUMN IF EXISTS unit_price_amount,
    DROP COLUMN IF EXISTS unit_price_currency,
    DROP COLUMN IF EXISTS subtotal_amount,
    DROP COLUMN IF EXISTS subtotal_currency,
    DROP COLUMN IF EXISTS tax_amount,
    DROP COLUMN IF EXISTS tax_currency;

-- 4. Drop Money Columns from orders
ALTER TABLE orders
    DROP COLUMN IF EXISTS total_amount,
    DROP COLUMN IF EXISTS total_currency,
    DROP COLUMN IF EXISTS tax_breakdown;

COMMIT;
