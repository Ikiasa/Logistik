-- Migration: 003_financial_integrity_schema
-- Description: Implements Money Pattern with BIGINT storage, Currency Isolation, and Immutable Ledger.
-- Author: Logistik Architect
-- Date: 2026-02-14

BEGIN;

-- 1. Add Composite Money Columns (BIGINT + CHAR(3))
-- We use BIGINT for minor units (e.g., cents) to prevent floating point errors.
-- We use CHAR(3) for ISO 4217 Currency Codes.

-- Table: orders
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS total_amount BIGINT DEFAULT 0 CHECK (total_amount >= 0),
    ADD COLUMN IF NOT EXISTS total_currency CHAR(3) DEFAULT 'IDR' CHECK (total_currency ~ '^[A-Z]{3}$'),
    ADD COLUMN IF NOT EXISTS tax_breakdown JSONB DEFAULT '[]'::jsonb; -- Flexible tax structure

-- Table: order_items
ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS unit_price_amount BIGINT DEFAULT 0 CHECK (unit_price_amount >= 0),
    ADD COLUMN IF NOT EXISTS unit_price_currency CHAR(3) DEFAULT 'IDR' CHECK (unit_price_currency ~ '^[A-Z]{3}$'),
    ADD COLUMN IF NOT EXISTS subtotal_amount BIGINT DEFAULT 0 CHECK (subtotal_amount >= 0),
    ADD COLUMN IF NOT EXISTS subtotal_currency CHAR(3) DEFAULT 'IDR' CHECK (subtotal_currency ~ '^[A-Z]{3}$'),
    ADD COLUMN IF NOT EXISTS tax_amount BIGINT DEFAULT 0 CHECK (tax_amount >= 0),
    ADD COLUMN IF NOT EXISTS tax_currency CHAR(3) DEFAULT 'IDR' CHECK (tax_currency ~ '^[A-Z]{3}$');

-- 2. Create Order Adjustments Ledger (Audit Trail)
-- Records ANY post-confirmation financial change. No in-place mutation of history.
CREATE TABLE IF NOT EXISTS order_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT, -- Prevent deletion of Audited Orders
    adjustment_amount BIGINT NOT NULL, -- Can be negative for credits
    adjustment_currency CHAR(3) NOT NULL CHECK (adjustment_currency ~ '^[A-Z]{3}$'),
    reason TEXT NOT NULL,
    authorized_by UUID, -- Link to User/System Actor
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_adjustments_order_id ON order_adjustments(order_id);

-- 2a. Enforce Append-Only Ledger (Immutability)
-- Prevent modification or deletion of adjustment records once written.
CREATE OR REPLACE FUNCTION protect_ledger_immutability()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Ledger Integrity Violation: Cannot update or delete financial adjustment records (ID: %). Create a correcting entry instead.', OLD.id;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_ledger_immutability ON order_adjustments;
CREATE TRIGGER trg_protect_ledger_immutability
BEFORE UPDATE OR DELETE ON order_adjustments
FOR EACH ROW
EXECUTE FUNCTION protect_ledger_immutability();

-- 3. Enforce Financial Immutability via Trigger
-- Block updates to financial columns once Order is CONFIRMED or beyond.

CREATE OR REPLACE FUNCTION protect_financial_integrity()
RETURNS TRIGGER AS $$
BEGIN
    -- Define locked statuses
    IF OLD.status IN ('CONFIRMED', 'SHIPPED', 'DELIVERED', 'COMPLETED') THEN
        -- Check for mutation of Order Totals
        IF (OLD.total_amount IS DISTINCT FROM NEW.total_amount) OR
           (OLD.total_currency IS DISTINCT FROM NEW.total_currency) OR
           (OLD.tax_breakdown IS DISTINCT FROM NEW.tax_breakdown) THEN
            RAISE EXCEPTION 'Financial Integrity Violation: Cannot modify financial records for Order % in status %. Use order_adjustments table.', OLD.id, OLD.status;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_financial_integrity ON orders;
CREATE TRIGGER trg_protect_financial_integrity
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION protect_financial_integrity();

-- 4. Cross-Column Currency Check (Optional but recommended)
-- Ensure Line Item currency matches Order currency (Simplified for now, usually enforced in App Layer)
-- A more complex trigger could enforce this if multi-currency orders are strictly banned at DB level.

COMMIT;
