-- Rollback script for cost control migration

-- Drop policies
DROP POLICY IF EXISTS fuel_logs_tenant_isolation ON fuel_logs;
DROP POLICY IF EXISTS maintenance_logs_tenant_isolation ON maintenance_logs;
DROP POLICY IF EXISTS op_expenses_tenant_isolation ON op_expenses;

-- Drop indexes
DROP INDEX IF EXISTS idx_fuel_vehicle;
DROP INDEX IF EXISTS idx_maintenance_vehicle;
DROP INDEX IF EXISTS idx_expenses_shipment;
DROP INDEX IF EXISTS idx_fuel_tenant_date;
DROP INDEX IF EXISTS idx_maintenance_tenant_date;
DROP INDEX IF EXISTS idx_expenses_tenant_date;
DROP INDEX IF EXISTS idx_expenses_vehicle;
DROP INDEX IF EXISTS idx_fuel_vehicle_date;
DROP INDEX IF EXISTS idx_maintenance_vehicle_date;

-- Drop tables
DROP TABLE IF EXISTS op_expenses;
DROP TABLE IF EXISTS maintenance_logs;
DROP TABLE IF EXISTS fuel_logs;
