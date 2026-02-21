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
