-- Rollback: 005_enterprise_hardening_schema
-- Description: Disables RLS and removes tenant_id columns.

BEGIN;

-- Disable RLS
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_orders ON orders;

ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_order_items ON order_items;

ALTER TABLE order_adjustments DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ledger ON order_adjustments;

ALTER TABLE addresses DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_addresses ON addresses;

ALTER TABLE outbox_events DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_outbox ON outbox_events;

-- Remove Columns (Data Loss of tenant association!)
ALTER TABLE orders DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE order_items DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE order_adjustments DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE outbox_events DROP COLUMN IF EXISTS tenant_id;

-- addresses.tenant_id existed before 005, do not drop.

COMMIT;
