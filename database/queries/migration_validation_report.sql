-- MIGRATION VALIDATION REPORT
-- Execute this AFTER running migrate_addresses.ts
-- Purpose: Verify data integrity, partition routing, and referential correctness.

-- 1. Total Counts Reconciliation
SELECT 
    (SELECT COUNT(*) FROM orders WHERE legacy_address_text IS NOT NULL) as total_legacy_attempts,
    (SELECT COUNT(*) FROM orders WHERE delivery_address_id IS NOT NULL) as migrated_orders,
    (SELECT COUNT(*) FROM addresses) as total_master_addresses,
    (SELECT COUNT(*) FROM orders WHERE delivery_address_id IS NULL AND legacy_address_text IS NOT NULL) as pending_or_failed;

-- 2. Partition Routing Check (Crucial)
-- Verify US addresses landed in addresses_us partition
SELECT 
    country_code, 
    COUNT(*) as count,
    CASE 
        WHEN country_code = 'US' THEN 'Expected in US Partition'
        WHEN country_code = 'DE' THEN 'Expected in DE Partition'
        ELSE 'Default Partition'
    END as partition_routing_check
FROM addresses
GROUP BY country_code;

-- 3. Deduplication Efficacy
-- High ratio means effective deduplication
SELECT 
    COUNT(*) as total_orders,
    COUNT(DISTINCT delivery_address_id) as unique_master_addresses,
    ROUND((1.0 - (COUNT(DISTINCT delivery_address_id)::NUMERIC / COUNT(*)::NUMERIC)) * 100, 2) || '%' as deduplication_rate
FROM orders
WHERE delivery_address_id IS NOT NULL;

-- 4. Orphaned References Check (Should be 0)
SELECT COUNT(*) as orphaned_references
FROM orders o
LEFT JOIN addresses a ON o.delivery_address_id = a.id
WHERE o.delivery_address_id IS NOT NULL AND a.id IS NULL;

-- 5. Data Fidelity Check (Snapshot vs Master)
-- Spot check 5 random records to ensure snapshot JSON aligns with Master
SELECT 
    o.id as order_id,
    o.delivery_address_snapshot as frozen_snapshot,
    a.structured_data as master_data,
    a.country_code as master_country
FROM orders o
JOIN addresses a ON o.delivery_address_id = a.id
ORDER BY random()
LIMIT 5;

-- 6. Index Usage Validation (Run EXPLAIN ANALYZE manually)
-- EXPLAIN ANALYZE SELECT * FROM addresses WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(-74.006, 40.7128), 4326), 500);
