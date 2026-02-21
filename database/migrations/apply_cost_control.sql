-- Combined migration script for cost control
-- Applies both base tables and RLS policies

\i 20260215_cost_control.sql
\i 20260215_cost_control_policies.sql

-- Verify tables were created
SELECT 'fuel_logs' as table_name, COUNT(*) as row_count FROM fuel_logs
UNION ALL
SELECT 'maintenance_logs', COUNT(*) FROM maintenance_logs
UNION ALL
SELECT 'op_expenses', COUNT(*) FROM op_expenses;

-- Verify indexes
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE tablename IN ('fuel_logs', 'maintenance_logs', 'op_expenses')
ORDER BY tablename, indexname;
