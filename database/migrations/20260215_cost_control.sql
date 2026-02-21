-- Fuel Logs
CREATE TABLE IF NOT EXISTS fuel_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    recorded_at TIMESTAMP DEFAULT NOW(),
    liters DECIMAL(10,2) NOT NULL,
    cost_per_liter DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (liters * cost_per_liter) STORED,
    odometer DECIMAL(10,2),
    location VARCHAR(200),
    receipt_photo TEXT
);

-- Maintenance Logs
CREATE TABLE IF NOT EXISTS maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    recorded_at TIMESTAMP DEFAULT NOW(),
    type VARCHAR(50), -- ROUTINE, REPAIR, TIRES, OIL, OTHER
    description TEXT,
    cost DECIMAL(12,2) NOT NULL,
    odometer DECIMAL(10,2),
    vendor_name VARCHAR(100)
);

-- Toll & Operational Expenses
CREATE TABLE IF NOT EXISTS op_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    shipment_id UUID,
    vehicle_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    recorded_at TIMESTAMP DEFAULT NOW(),
    type VARCHAR(50), -- TOLL, PARKING, LOADING, OTHER
    amount DECIMAL(10,2) NOT NULL,
    receipt_photo TEXT
);

-- Indexes for financial lookup
CREATE INDEX IF NOT EXISTS idx_fuel_vehicle ON fuel_logs(vehicle_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle ON maintenance_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_expenses_shipment ON op_expenses(shipment_id);

-- Multi-tenant isolation
ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE op_expenses ENABLE ROW LEVEL SECURITY;
