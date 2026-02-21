-- Digital Shift Logs
CREATE TABLE IF NOT EXISTS shift_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    start_at TIMESTAMP DEFAULT NOW(),
    end_at TIMESTAMP,
    start_odometer DECIMAL(10,2),
    end_odometer DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED
    checklist_data JSONB DEFAULT '{}'
);

-- Vehicle Inspections
CREATE TABLE IF NOT EXISTS vehicle_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    inspection_type VARCHAR(20), -- PRE_TRIP, POST_TRIP
    recorded_at TIMESTAMP DEFAULT NOW(),
    items JSONB NOT NULL,
    has_issues BOOLEAN DEFAULT FALSE,
    issue_details TEXT
);

-- Incident Reporting
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    type VARCHAR(50), -- ACCIDENT, BREAKDOWN, FUEL_THEFT, OTHER
    severity VARCHAR(20), -- LOW, MEDIUM, HIGH, CRITICAL
    description TEXT,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    recorded_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'OPEN',
    photos TEXT[]
);

-- Delivery Verification (Digital POD)
CREATE TABLE IF NOT EXISTS delivery_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    shipment_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    verified_at TIMESTAMP DEFAULT NOW(),
    recipient_name VARCHAR(100),
    recipient_signature TEXT, -- Base64 or URL
    photo_evidence TEXT[],
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    notes TEXT
);

-- Multi-tenant isolation for all new tables
ALTER TABLE shift_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_verifications ENABLE ROW LEVEL SECURITY;

-- Indexing for lookup performance
CREATE INDEX IF NOT EXISTS idx_shift_driver ON shift_logs(driver_id, status);
CREATE INDEX IF NOT EXISTS idx_inspections_vehicle ON vehicle_inspections(vehicle_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_delivery_shipment ON delivery_verifications(shipment_id);
