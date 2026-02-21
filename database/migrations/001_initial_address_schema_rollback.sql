-- Rollback Migration: 001_address_normalization_schema_rollback
-- Description: Drops geo_regions, addresses, address_overrides tables and restores legacy order state.
-- Author: Logistik Architect
-- Date: 2026-02-14

-- 1. Drop Audit and Override Tables
DROP TABLE IF EXISTS address_overrides;

-- 2. Drop Partitioned Master Table (Cascades to partitions)
DROP TABLE IF EXISTS addresses CASCADE;

-- 3. Drop Reference Data
DROP TABLE IF EXISTS geo_regions;

-- 4. Revert Order Modifications (If applied)
/* 
-- UNCOMMENT TO REVERT CHANGES TO ORDERS TABLE
ALTER TABLE orders 
    DROP COLUMN IF EXISTS delivery_address_id,
    DROP COLUMN IF EXISTS delivery_address_country_code,
    DROP COLUMN IF EXISTS delivery_address_snapshot,
    DROP COLUMN IF EXISTS legacy_address_text;
*/

-- 5. Drop PostGIS Extension (Optional, usually kept)
-- DROP EXTENSION IF EXISTS postgis;
