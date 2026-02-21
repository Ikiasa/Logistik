-- RLS Policies for Cost Control Tables
-- Ensures multi-tenant data isolation

-- Fuel Logs Policies
DROP POLICY IF EXISTS fuel_logs_tenant_isolation ON fuel_logs;
CREATE POLICY fuel_logs_tenant_isolation ON fuel_logs
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Maintenance Logs Policies  
DROP POLICY IF EXISTS maintenance_logs_tenant_isolation ON maintenance_logs;
CREATE POLICY maintenance_logs_tenant_isolation ON maintenance_logs
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Operational Expenses Policies
DROP POLICY IF EXISTS op_expenses_tenant_isolation ON op_expenses;
CREATE POLICY op_expenses_tenant_isolation ON op_expenses
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Additional indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_fuel_tenant_date ON fuel_logs(tenant_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_tenant_date ON maintenance_logs(tenant_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_tenant_date ON op_expenses(tenant_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_vehicle ON op_expenses(vehicle_id, recorded_at DESC);

-- Composite index for common profitability queries
CREATE INDEX IF NOT EXISTS idx_fuel_vehicle_date ON fuel_logs(vehicle_id, recorded_at DESC, tenant_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle_date ON maintenance_logs(vehicle_id, recorded_at DESC, tenant_id);
