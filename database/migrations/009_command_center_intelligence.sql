-- Migration: 009_command_center_intelligence
-- Description: Enables PostGIS and implements Geofencing, Incident tracking, and ETA support.
-- Author: Logistik Architect
-- Date: 2026-02-15

BEGIN;

-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Geofences Table (Spatial)
CREATE TABLE IF NOT EXISTS geofences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('WAREHOUSE', 'PORT', 'CUSTOMER', 'DEPOT')),
    area GEOMETRY(Polygon, 4326) NOT NULL, -- WGS 84
    address TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for spatial queries
CREATE INDEX IF NOT EXISTS geofences_area_idx ON geofences USING GIST (area);

-- 3. Incidents Table
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    shipment_id UUID,
    type VARCHAR(30) NOT NULL CHECK (type IN ('STOPPED', 'OFF_ROUTE', 'OFFLINE', 'OVERSPEED', 'GEOFENCE_VIOLATION')),
    severity VARCHAR(10) NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED')),
    description TEXT,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    metadata JSONB,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Geofence History (Log of entries/exits)
CREATE TABLE IF NOT EXISTS geofence_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    geofence_id UUID NOT NULL REFERENCES geofences(id),
    event_type VARCHAR(10) NOT NULL CHECK (event_type IN ('ENTER', 'EXIT')),
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- 5. Update Shipments with ETA support
ALTER TABLE shipments
    ADD COLUMN IF NOT EXISTS estimated_arrival_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS last_eta_update_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS destination_geofence_id UUID REFERENCES geofences(id);

-- 6. Update Vehicle Tracking to store status history more explicitly
ALTER TABLE vehicle_tracking
    ADD COLUMN IF NOT EXISTS battery_level INTEGER,
    ADD COLUMN IF NOT EXISTS signal_strength INTEGER;

COMMIT;
