-- Migration: Create vehicle_tracking table with RLS
-- Date: 2026-02-15

CREATE TABLE IF NOT EXISTS vehicle_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    speed INTEGER NOT NULL, -- Speed in km/h
    heading INTEGER NOT NULL, -- Heading in degrees (0-359)
    metadata JSONB DEFAULT '{}'::jsonb,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE vehicle_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy for Tenant Isolation
DROP POLICY IF EXISTS tenant_isolation_tracking ON vehicle_tracking;
CREATE POLICY tenant_isolation_tracking ON vehicle_tracking
    FOR ALL
    TO authenticated
    USING (tenant_id = (current_setting('app.current_tenant_id', true)::uuid)); -- Added true to current_setting

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_tracking_vehicle_id ON vehicle_tracking(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_tracking_recorded_at ON vehicle_tracking(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_tenant_id ON vehicle_tracking(tenant_id);

-- Create history view for last 24h
CREATE OR REPLACE VIEW vehicle_last_location AS
SELECT DISTINCT ON (vehicle_id) *
FROM vehicle_tracking
ORDER BY vehicle_id, recorded_at DESC;
