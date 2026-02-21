-- STAGING SETUP: Legacy Data Seed
-- Description: Creates legacy 'orders' table and populates it with realistic "messy" data.
-- Usage: Run this BEFORE the migration script to simulate a brownfield environment.

-- 1. Setup Legacy Schema (Simulated)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000000', -- System tenant for testing
    legacy_address_text TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Seed Data (1000 Rows of mixed quality)

-- Category A: Good Data (Should Geocode & Dedupe)
INSERT INTO orders (legacy_address_text)
SELECT '123 Main St, New York, NY 10001, USA' 
FROM generate_series(1, 400); -- 400 duplicates of the same location (High dedupe test)

-- Category B: International Data (Should route to 'DE' partition)
INSERT INTO orders (legacy_address_text)
SELECT 'Alexanderplatz 1, 10178 Berlin, Germany'
FROM generate_series(1, 300);

-- Category C: Messy/Partial Data (Should Geocode with heuristic or fail)
INSERT INTO orders (legacy_address_text)
SELECT 
    (ARRAY['100 Broadway, NYC', '5th Ave & 42nd St', 'Empire State Building', 'Unknown Location'])[floor(random() * 4 + 1)]
FROM generate_series(1, 200);

-- Category D: Bad Data (Should Fail / Warning)
INSERT INTO orders (legacy_address_text)
SELECT 'FAIL_PERMANENT: Invalid Address Here'
FROM generate_series(1, 50);

-- Category E: Transient Failures (Should Retry then Succeed/Fail)
INSERT INTO orders (legacy_address_text)
SELECT 'FAIL_TRANSIENT: Retry Me'
FROM generate_series(1, 50);

-- Verify Seed
SELECT count(*) as total_legacy_orders FROM orders;
