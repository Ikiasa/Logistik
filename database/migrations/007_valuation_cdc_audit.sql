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
