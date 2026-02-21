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
