-- Migration: 008_cfo_finance_upgrade
-- Description: Implement CFO-level financial tracking, automated invoicing, and multi-currency schema.
-- Author: Logistik Architect
-- Date: 2026-02-21

BEGIN;

-- 1. Shipments Table (Connects Orders to Logistics Assets)
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id),
    vehicle_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_TRANSIT, DELIVERED, CANCELLED
    
    -- Analytics Breakdown (Stored to avoid re-calculation overhead)
    actual_distance_km DECIMAL(12,2) DEFAULT 0,
    fuel_cost_amount BIGINT DEFAULT 0,
    fuel_cost_currency VARCHAR(3) DEFAULT 'IDR',
    toll_cost_amount BIGINT DEFAULT 0,
    toll_cost_currency VARCHAR(3) DEFAULT 'IDR',
    driver_overtime_amount BIGINT DEFAULT 0,
    driver_overtime_currency VARCHAR(3) DEFAULT 'IDR',
    idle_cost_amount BIGINT DEFAULT 0,
    idle_cost_currency VARCHAR(3) DEFAULT 'IDR',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipments_tenant_order ON shipments(tenant_id, order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);

-- 2. Invoicing System
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    shipment_id UUID UNIQUE NOT NULL REFERENCES shipments(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL, -- Format: INV-YYYY-XXXX
    
    total_amount BIGINT NOT NULL,
    total_currency VARCHAR(3) DEFAULT 'IDR',
    
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, ISSUED, PAID, OVERDUE
    due_date TIMESTAMP WITH TIME ZONE,
    issued_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Immutable Record Lock
    is_locked BOOLEAN DEFAULT FALSE,
    pdf_path TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Invoice Number Sequence Logic
CREATE TABLE IF NOT EXISTS invoice_counters (
    tenant_id UUID PRIMARY KEY REFERENCES tenants(id),
    current_year INT NOT NULL,
    last_val INT DEFAULT 0
);

-- Function to generate next invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number(t_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    curr_yr INT := EXTRACT(YEAR FROM CURRENT_DATE);
    next_val INT;
    v_invoice_no VARCHAR;
BEGIN
    INSERT INTO invoice_counters (tenant_id, current_year, last_val)
    VALUES (t_id, curr_yr, 1)
    ON CONFLICT (tenant_id) DO UPDATE
    SET last_val = CASE 
        WHEN invoice_counters.current_year = curr_yr THEN invoice_counters.last_val + 1 
        ELSE 1 
    END,
    current_year = curr_yr
    RETURNING last_val INTO next_val;

    RETURN 'INV-' || curr_yr || '-' || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 4. Immutability Trigger for Invoices
CREATE OR REPLACE FUNCTION lock_invoice_on_issue()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_locked = TRUE THEN
        RAISE EXCEPTION 'Invoice Integrity Violation: Cannot modify a locked invoice (ID: %).', OLD.id;
    END IF;
    
    -- Lock when status moves past DRAFT
    IF NEW.status IN ('ISSUED', 'PAID', 'OVERDUE') THEN
        NEW.is_locked := TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lock_invoice
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION lock_invoice_on_issue();

-- 5. Multi-tenant RLS
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

COMMIT;
