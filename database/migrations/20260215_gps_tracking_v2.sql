-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    plate_number VARCHAR(20),
    type VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Vehicle Tracking Table (Optimized for time-series)
CREATE TABLE IF NOT EXISTS vehicle_tracking (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    speed DECIMAL(5,2),
    heading INT,
    accuracy INT,
    status VARCHAR(20),
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_tracking_vehicle_time ON vehicle_tracking(vehicle_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_tenant_time ON vehicle_tracking(tenant_id, recorded_at DESC);

-- Multi-Tenant Isolation (RLS)
ALTER TABLE vehicle_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON vehicle_tracking;
CREATE POLICY tenant_isolation ON vehicle_tracking
USING (tenant_id = current_setting('app.current_tenant', true)::UUID);

-- Seed Initial Dummy Data
INSERT INTO vehicles (id, tenant_id, plate_number, type)
VALUES 
('11111111-2222-3333-4444-555555555551', '11111111-1111-1111-1111-111111111111', 'B 1234 TRK', 'Truck'),
('11111111-2222-3333-4444-555555555552', '11111111-1111-1111-1111-111111111111', 'B 5678 VAN', 'Van')
ON CONFLICT (id) DO NOTHING;

INSERT INTO drivers (id, tenant_id, name, phone)
VALUES
('21111111-2222-3333-4444-555555555551', '11111111-1111-1111-1111-111111111111', 'Ahmad Saputra', '081234567890'),
('21111111-2222-3333-4444-555555555552', '11111111-1111-1111-1111-111111111111', 'Budi Santoso', '081298765432')
ON CONFLICT (id) DO NOTHING;
