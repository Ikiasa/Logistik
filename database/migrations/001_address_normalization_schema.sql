-- Migration: 001_address_normalization_schema
-- Description: Sets up geo_regions, partitioned addresses table, overrides, and order modifications.
-- Author: Logistik Architect
-- Date: 2026-02-14

-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Reference Data: Geo Regions (Administrative Boundaries)
CREATE TABLE IF NOT EXISTS geo_regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code CHAR(2) NOT NULL, -- ISO 3166-1 alpha-2
    state_province VARCHAR(100),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    boundary GEOGRAPHY(POLYGON),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_geo_regions_lookup ON geo_regions (country_code, postal_code, city);
CREATE INDEX IF NOT EXISTS idx_geo_regions_boundary ON geo_regions USING GIST (boundary);

-- 3. Master Data: Addresses (Partitioned by Country)
CREATE TABLE IF NOT EXISTS addresses (
    id UUID DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hash CHAR(64) NOT NULL, -- SHA-256 deduplication
    
    -- Structured Address Components
    structured_data JSONB NOT NULL,
    formatted_address TEXT NOT NULL,
    
    -- Geospatial Data
    location GEOGRAPHY(POINT),
    
    -- Validation Metadata
    -- Switch to CHECK constraint for easier future expansion
    validation_status VARCHAR(50) NOT NULL CHECK (validation_status IN ('unverified', 'verified_interpolated', 'verified_rooftop', 'failed')),
    last_validated_at TIMESTAMP WITH TIME ZONE,
    
    -- Region Partitioning Key
    country_code CHAR(2) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints & Keys
    -- Partitioning requires partition key in PK
    PRIMARY KEY (id, country_code)
) PARTITION BY LIST (country_code);

-- 3.1 Partitions
CREATE TABLE IF NOT EXISTS addresses_default PARTITION OF addresses DEFAULT;
CREATE TABLE IF NOT EXISTS addresses_us PARTITION OF addresses FOR VALUES IN ('US');
CREATE TABLE IF NOT EXISTS addresses_de PARTITION OF addresses FOR VALUES IN ('DE');

-- 3.2 Indexes (Propagated automatically in PG 11+)
CREATE INDEX IF NOT EXISTS idx_addresses_tenant ON addresses (tenant_id);
CREATE INDEX IF NOT EXISTS idx_addresses_hash ON addresses (hash);
CREATE INDEX IF NOT EXISTS idx_addresses_location ON addresses USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_addresses_region_lookup ON addresses (country_code, (structured_data->>'postal_code'), (structured_data->>'city'));

-- 4. Audit: Address Overrides
CREATE TABLE IF NOT EXISTS address_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL, 
    
    -- Link to Address (Logical due to partitioning)
    address_id UUID NOT NULL,
    
    -- User Action Tracking
    overridden_by UUID NOT NULL, -- FK to users table (logical or explicit depending on user architecture)
    
    -- Override Details
    override_reason_code VARCHAR(50) NOT NULL, -- e.g., 'NEW_CONSTRUCTION'
    justification_note TEXT,
    
    -- State Transition Logging
    previous_validation_status VARCHAR(50),
    new_validation_status VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_address_overrides_address ON address_overrides (address_id);
CREATE INDEX IF NOT EXISTS idx_address_overrides_user ON address_overrides (overridden_by);
CREATE INDEX IF NOT EXISTS idx_address_overrides_tenant ON address_overrides (tenant_id);

-- 4.5 Update Orders with Address Tracking
ALTER TABLE orders 
    ADD COLUMN IF NOT EXISTS delivery_address_id UUID,
    ADD COLUMN IF NOT EXISTS delivery_address_country_code CHAR(2),
    ADD COLUMN IF NOT EXISTS delivery_address_snapshot JSONB,
    ADD COLUMN IF NOT EXISTS legacy_address_text TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_delivery_address ON orders(delivery_address_id);

-- 5. Helper Functions (Optional)
-- Ensure consistency of country code
CREATE OR REPLACE FUNCTION check_partition_bounds() RETURNS TRIGGER AS $$
BEGIN
    -- Logic to ensure country_code matches partition can be added here if needed
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
