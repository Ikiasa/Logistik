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
