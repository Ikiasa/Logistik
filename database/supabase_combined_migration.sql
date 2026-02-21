-- Migration: 000_base_schema
-- Description: Core tables for the Logistik ERP (Tenants, Orders, Items)
-- Date: 2026-02-16

BEGIN;

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    subscription_tier VARCHAR(20) DEFAULT 'standard',
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- tenant_id will be added by migration 005
    external_order_id VARCHAR,
    customer_name VARCHAR,
    delivery_address TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- tenant_id will be added by migration 005
    order_id UUID NOT NULL REFERENCES orders(id),
    sku VARCHAR,
    quantity INT,
    description VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed System Tenant
INSERT INTO tenants (id, name, slug, subscription_tier)
VALUES ('00000000-0000-0000-0000-000000000000', 'System', 'system', 'enterprise')
ON CONFLICT (id) DO NOTHING;

COMMIT;

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

-- Migration: 004_outbox_pattern_schema
-- Description: Implements Transactional Outbox Pattern for Reliable Event Publishing.
-- Author: Logistik Architect
-- Date: 2026-02-14

BEGIN;

-- 1. Create Outbox Table
-- Stores events that MUST be published to the Message Broker.
-- Inserted in the same transaction as the business state change.
CREATE TABLE IF NOT EXISTS outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(50) NOT NULL, -- e.g. 'Order'
    aggregate_id UUID NOT NULL, -- e.g. Order ID
    event_type VARCHAR(100) NOT NULL, -- e.g. 'OrderCreated'
    payload JSONB NOT NULL, -- The Event Data (Fact)
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Processing State
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PUBLISHED', 'FAILED')),
    retry_count INT DEFAULT 0,
    next_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- For Exponential Backoff
    last_error TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- For auditing state changes
);

-- 2. Indexes for Performance
-- Critical for Worker Polling (SELECT ... WHERE status='PENDING' AND next_attempt_at <= NOW())
CREATE INDEX IF NOT EXISTS idx_outbox_poll ON outbox_events(status, next_attempt_at);

-- For Tracing / Debugging history of an Aggregate
CREATE INDEX IF NOT EXISTS idx_outbox_aggregate ON outbox_events(aggregate_type, aggregate_id);

-- 3. Maintenance / Housekeeping
-- A partial index to easily find FAILED events for alerting
CREATE INDEX IF NOT EXISTS idx_outbox_failed ON outbox_events(status) WHERE status = 'FAILED';

-- 4. Auto-update Trigger
CREATE OR REPLACE FUNCTION update_outbox_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_outbox_timestamp ON outbox_events;
CREATE TRIGGER trg_update_outbox_timestamp
BEFORE UPDATE ON outbox_events
FOR EACH ROW
EXECUTE FUNCTION update_outbox_timestamp();

COMMIT;

-- Migration: 005_enterprise_hardening_schema
-- Description: Enforces Tenant Isolation via RLS and adds necessary columns.
-- Author: Logistik Architect
-- Date: 2026-02-15

BEGIN;

-- 0. Define Default Tenant for Backfill (System Tenant)
-- Using nil UUID for legacy data
-- Ideally, this should be replaced with real tenant IDs in production.

-- 1. Add tenant_id to Tables (Nullable first)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS tenant_id UUID;
-- addresses table already has tenant_id (from 001).
ALTER TABLE order_adjustments ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE outbox_events ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- 2. Backfill Existing Data
UPDATE orders SET tenant_id = '00000000-0000-0000-0000-000000000000' WHERE tenant_id IS NULL;
UPDATE order_items SET tenant_id = '00000000-0000-0000-0000-000000000000' WHERE tenant_id IS NULL;
UPDATE order_adjustments SET tenant_id = '00000000-0000-0000-0000-000000000000' WHERE tenant_id IS NULL;
UPDATE outbox_events SET tenant_id = '00000000-0000-0000-0000-000000000000' WHERE tenant_id IS NULL;

-- 3. Enforce NOT NULL
ALTER TABLE orders ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE order_items ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE order_adjustments ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE outbox_events ALTER COLUMN tenant_id SET NOT NULL;

-- 4. Indexes for RLS Performance (Created BEFORE enabling RLS)
CREATE INDEX IF NOT EXISTS idx_orders_tenant_composite ON orders(tenant_id, id);
CREATE INDEX IF NOT EXISTS idx_order_items_tenant_composite ON order_items(tenant_id, id);
CREATE INDEX IF NOT EXISTS idx_ledger_tenant_composite ON order_adjustments(tenant_id, id);
CREATE INDEX IF NOT EXISTS idx_outbox_tenant_composite ON outbox_events(tenant_id, id);

-- 5. Enable RLS and Policies

-- Helper to create policy generally
-- We assume app connects with `app.current_tenant` set.

-- ORDERS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_orders ON orders;
CREATE POLICY tenant_isolation_orders ON orders 
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- ORDER ITEMS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_order_items ON order_items;
CREATE POLICY tenant_isolation_order_items ON order_items 
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- ORDER ADJUSTMENTS
ALTER TABLE order_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_adjustments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ledger ON order_adjustments;
CREATE POLICY tenant_isolation_ledger ON order_adjustments 
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- ADDRESSES (Already has tenant_id, just enable RLS)
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_addresses ON addresses;
CREATE POLICY tenant_isolation_addresses ON addresses 
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- OUTBOX EVENTS
ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_events FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_outbox ON outbox_events;
CREATE POLICY tenant_isolation_outbox ON outbox_events 
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

COMMIT;

-- Migration: 006_api_hardening_idempotency
-- Description: Adds idempotency_keys table for API reliability.
-- Author: Logistik Architect
-- Date: 2026-02-15

BEGIN;

-- 1. Create Idempotency Table
CREATE TABLE IF NOT EXISTS idempotency_keys (
    id UUID DEFAULT gen_random_uuid(), -- Internal ID
    tenant_id UUID NOT NULL,          -- RLS Scope
    key VARCHAR(255) NOT NULL,        -- Client Provided Key
    
    status VARCHAR(50) NOT NULL CHECK (status IN ('STARTED', 'COMPLETED', 'FAILED')),
    
    -- Response Caching
    response_code INT,
    response_body JSONB,
    
    -- Safety & Expiry
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    locked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (tenant_id, key) -- Composite PK ensures uniqueness per tenant
);

-- 2. Indexes
-- PK provides index on (tenant_id, key).
-- Index for cleanup (expiry)
CREATE INDEX IF NOT EXISTS idx_idempotency_created_at ON idempotency_keys(created_at);

-- 3. RLS Enforcement
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_keys FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_idempotency ON idempotency_keys;
CREATE POLICY tenant_isolation_idempotency ON idempotency_keys
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

COMMIT;

-- Migration: 007_valuation_cdc_audit
-- Description: Implements comprehensive Change Data Capture (CDC) and Audit Logging.
-- Author: Logistik Architect
-- Date: 2026-02-15

BEGIN;

-- 1. Create Partitioned Audit Logs Table
-- We use partitioning by date to manage high volume.
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    
    -- Target
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL, -- UUIDs cast to text
    
    -- Action
    operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    
    -- Data Capture (CDC)
    old_values JSONB,
    new_values JSONB,
    
    -- Context
    changed_by UUID, -- Captured from app.current_user
    tenant_id UUID NOT NULL, -- RLS Scope
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Partition Key
    PRIMARY KEY (created_at, id)
) PARTITION BY RANGE (created_at);

-- Create initial partitions (Current Month + Next Month)
-- Dynamic partition creation usually handled by cron, but we create defaults here.
CREATE TABLE IF NOT EXISTS audit_logs_default PARTITION OF audit_logs DEFAULT;

-- 2. Enable RLS on Audit Logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

-- Tenants can only see and create their own audit trails
DROP POLICY IF EXISTS tenant_isolation_audit ON audit_logs;
CREATE POLICY tenant_isolation_audit ON audit_logs
    USING (tenant_id = current_setting('app.current_tenant')::uuid)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::uuid);


-- 3. Generic Audit Trigger Function
CREATE OR REPLACE FUNCTION fn_audit_trigger() RETURNS TRIGGER AS $$
DECLARE
    row_tenant_id UUID;
    row_id TEXT;
    old_val JSONB := NULL;
    new_val JSONB := NULL;
    app_user UUID;
BEGIN
    -- Attempt to get Current User ID from Session
    BEGIN
        app_user := current_setting('app.current_user', true)::UUID;
    EXCEPTION WHEN OTHERS THEN
        app_user := NULL;
    END;

    -- Determine Operation and Values
    IF (TG_OP = 'DELETE') THEN
        row_tenant_id := OLD.tenant_id;
        row_id := OLD.id::TEXT;
        old_val := to_jsonb(OLD);
    ELSIF (TG_OP = 'UPDATE') THEN
        row_tenant_id := NEW.tenant_id;
        row_id := NEW.id::TEXT;
        old_val := to_jsonb(OLD);
        new_val := to_jsonb(NEW);
    ELSIF (TG_OP = 'INSERT') THEN
        row_tenant_id := NEW.tenant_id;
        row_id := NEW.id::TEXT;
        new_val := to_jsonb(NEW);
    END IF;

    -- Insert Audit Record
    -- Note: We bypass RLS for the insertion itself using SECURITY DEFINER if needed, 
    -- but here we rely on the fact that the transaction already has the tenant/user context set.
    -- However, if RLS on audit_logs enforces tenant_id match, we must ensure we insert the correct tenant_id.
    
    INSERT INTO audit_logs (
        table_name,
        record_id,
        operation,
        old_values,
        new_values,
        changed_by,
        tenant_id
    ) VALUES (
        TG_TABLE_NAME,
        row_id,
        TG_OP,
        old_val,
        new_val,
        app_user,
        row_tenant_id
    );

    RETURN NULL; -- Result is ignored for AFTER triggers
END;
$$ LANGUAGE plpgsql;


-- 4. Apply Triggers to Critical Tables

-- Orders
DROP TRIGGER IF EXISTS trg_audit_orders ON orders;
CREATE TRIGGER trg_audit_orders
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

-- Order Adjustments (Financial Ledger)
DROP TRIGGER IF EXISTS trg_audit_order_adjustments ON order_adjustments;
CREATE TRIGGER trg_audit_order_adjustments
AFTER INSERT OR UPDATE OR DELETE ON order_adjustments
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

-- Idempotency Keys (Tech Audit)
DROP TRIGGER IF EXISTS trg_audit_idempotency_keys ON idempotency_keys;
CREATE TRIGGER trg_audit_idempotency_keys
AFTER INSERT OR UPDATE OR DELETE ON idempotency_keys
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

COMMIT;

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

-- Migration: 009_command_center_intelligence
-- Description: Enables PostGIS and implements Geofencing, Incident tracking, and ETA support.
-- Author: Logistik Architect
-- Date: 2026-02-15

BEGIN;

-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Geofences Table (Spatial)
CREATE TABLE IF NOT EXISTS geofences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('WAREHOUSE', 'PORT', 'CUSTOMER', 'DEPOT')),
    area GEOMETRY(Polygon, 4326) NOT NULL, -- WGS 84
    address TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for spatial queries
CREATE INDEX IF NOT EXISTS geofences_area_idx ON geofences USING GIST (area);

-- 3. Incidents Table
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    shipment_id UUID,
    type VARCHAR(30) NOT NULL CHECK (type IN ('STOPPED', 'OFF_ROUTE', 'OFFLINE', 'OVERSPEED', 'GEOFENCE_VIOLATION')),
    severity VARCHAR(10) NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED')),
    description TEXT,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    metadata JSONB,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Geofence History (Log of entries/exits)
CREATE TABLE IF NOT EXISTS geofence_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    geofence_id UUID NOT NULL REFERENCES geofences(id),
    event_type VARCHAR(10) NOT NULL CHECK (event_type IN ('ENTER', 'EXIT')),
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- 5. Update Shipments with ETA support
ALTER TABLE shipments
    ADD COLUMN IF NOT EXISTS estimated_arrival_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS last_eta_update_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS destination_geofence_id UUID REFERENCES geofences(id);

-- 6. Update Vehicle Tracking to store status history more explicitly
ALTER TABLE vehicle_tracking
    ADD COLUMN IF NOT EXISTS battery_level INTEGER,
    ADD COLUMN IF NOT EXISTS signal_strength INTEGER;

COMMIT;

-- Migration: 010_enterprise_security_rbac
-- Description: Implements Users table with Roles, Permission Matrix, and Audit Trail Expansion.
-- Author: Logistik Architect
-- Date: 2026-02-15

BEGIN;

-- 1. Create Roles Enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'FINANCE', 'DISPATCHER', 'DRIVER', 'AUDITOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'DRIVER',
    full_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for tenant-based user lookup
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);

-- 3. Create Rate Matrix Table (Persisting the FE logic)
CREATE TABLE IF NOT EXISTS rate_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    min_weight_kg DECIMAL(10,2) NOT NULL,
    max_weight_kg DECIMAL(10,2) NOT NULL,
    rate_per_kg_amount BIGINT NOT NULL,
    rate_per_kg_currency VARCHAR(3) DEFAULT 'IDR',
    base_fee_amount BIGINT NOT NULL,
    base_fee_currency VARCHAR(3) DEFAULT 'IDR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Audit Trail Expansion (Attaching triggers from Migration 007)
-- Triggers for Invoices
DROP TRIGGER IF EXISTS trg_audit_invoices ON invoices;
CREATE TRIGGER trg_audit_invoices
AFTER INSERT OR UPDATE OR DELETE ON invoices
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

-- Triggers for Shipments
DROP TRIGGER IF EXISTS trg_audit_shipments ON shipments;
CREATE TRIGGER trg_audit_shipments
AFTER INSERT OR UPDATE OR DELETE ON shipments
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

-- Triggers for Rate Matrix
DROP TRIGGER IF EXISTS trg_audit_rate_matrix ON rate_matrix;
CREATE TRIGGER trg_audit_rate_matrix
AFTER INSERT OR UPDATE OR DELETE ON rate_matrix
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

-- Triggers for Users
DROP TRIGGER IF EXISTS trg_audit_users ON users;
CREATE TRIGGER trg_audit_users
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();


-- 5. Seed Initial Users for Testing (System Tenant)
INSERT INTO users (id, tenant_id, email, role, full_name)
VALUES 
    ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'admin@logistik.com', 'SUPER_ADMIN', 'Global Admin'),
    ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'finance@logistik.com', 'FINANCE', 'Finance Lead'),
    ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'ops@logistik.com', 'DISPATCHER', 'Head Dispatcher'),
    ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'driver@logistik.com', 'DRIVER', 'Main Driver'),
    ('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000000', 'auditor@logistik.com', 'AUDITOR', 'External Auditor')
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role;

COMMIT;

-- Migration: Create vehicle_tracking table with RLS
-- Date: 2026-02-15

CREATE TABLE IF NOT EXISTS vehicle_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    speed INTEGER NOT NULL, -- Speed in km/h
    heading INTEGER NOT NULL, -- Heading in degrees (0-359)
    metadata JSONB DEFAULT '{}'::jsonb,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE vehicle_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy for Tenant Isolation
DROP POLICY IF EXISTS tenant_isolation_tracking ON vehicle_tracking;
CREATE POLICY tenant_isolation_tracking ON vehicle_tracking
    FOR ALL
    TO authenticated
    USING (tenant_id = (current_setting('app.current_tenant_id', true)::uuid)); -- Added true to current_setting

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_tracking_vehicle_id ON vehicle_tracking(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_tracking_recorded_at ON vehicle_tracking(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_tenant_id ON vehicle_tracking(tenant_id);

-- Create history view for last 24h
CREATE OR REPLACE VIEW vehicle_last_location AS
SELECT DISTINCT ON (vehicle_id) *
FROM vehicle_tracking
ORDER BY vehicle_id, recorded_at DESC;

-- Fuel Logs
CREATE TABLE IF NOT EXISTS fuel_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    recorded_at TIMESTAMP DEFAULT NOW(),
    liters DECIMAL(10,2) NOT NULL,
    cost_per_liter DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (liters * cost_per_liter) STORED,
    odometer DECIMAL(10,2),
    location VARCHAR(200),
    receipt_photo TEXT
);

-- Maintenance Logs
CREATE TABLE IF NOT EXISTS maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    recorded_at TIMESTAMP DEFAULT NOW(),
    type VARCHAR(50), -- ROUTINE, REPAIR, TIRES, OIL, OTHER
    description TEXT,
    cost DECIMAL(12,2) NOT NULL,
    odometer DECIMAL(10,2),
    vendor_name VARCHAR(100)
);

-- Toll & Operational Expenses
CREATE TABLE IF NOT EXISTS op_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    shipment_id UUID,
    vehicle_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    recorded_at TIMESTAMP DEFAULT NOW(),
    type VARCHAR(50), -- TOLL, PARKING, LOADING, OTHER
    amount DECIMAL(10,2) NOT NULL,
    receipt_photo TEXT
);

-- Indexes for financial lookup
CREATE INDEX IF NOT EXISTS idx_fuel_vehicle ON fuel_logs(vehicle_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle ON maintenance_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_expenses_shipment ON op_expenses(shipment_id);

-- Multi-tenant isolation
ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE op_expenses ENABLE ROW LEVEL SECURITY;

