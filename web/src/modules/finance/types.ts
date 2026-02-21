export interface VehicleProfitability {
    vehicleId: string;
    revenue: number;
    fuelCosts: number;
    maintenanceCosts: number;
    opExpenses: number;
    totalCosts: number;
    netMargin: number;
    marginPercentage: number;
    costPerKm: number;
    revenuePerKm: number;
    distanceTraveled: number;
    idleCost: number;
    idleTimePercentage: number;
}

export interface FleetProfitability {
    totalRevenue: number;
    totalCosts: number;
    netMargin: number;
    marginPercentage: number;
    vehicleCount: number;
    vehicles: VehicleProfitability[];
}

export interface CostAnomaly {
    vehicleId: string;
    type: 'COST_EXCEEDS_REVENUE' | 'FUEL_EFFICIENCY' | 'MAINTENANCE_SPIKE' | 'IDLE_TIME';
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    message: string;
    detectedAt: string;
    value: number;
    threshold: number;
}

export interface CostBreakdown {
    fuel: number;
    maintenance: Record<string, number>;
    operational: Record<string, number>;
}

export interface FuelEfficiency {
    totalLiters: number;
    distanceTraveled: number;
    litersPer100Km: number;
    refuelCount: number;
    avgCostPerLiter: number;
}

export interface IdleCostImpact {
    idleTimeHours: number;
    idleCostPerHour: number;
    totalIdleCost: number;
    totalCostsWithIdle: number;
    idleCostPercentage: number;
}

export interface RateTier {
    id: string;
    minWeightKg: number;
    maxWeightKg: number;
    ratePerKgCents: number;
    baseFeeCents: number;
}

export interface RateMatrix {
    id: string;
    name: string;
    tiers: RateTier[];
}
export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPriceCents: number;
    totalCents: number;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    customerId: string;
    customerName: string;
    status: InvoiceStatus;
    issueDate: string;
    dueDate: string;
    subtotalCents: number;
    taxCents: number;
    totalCents: number;
    items: InvoiceItem[];
    tenantId: string;
}
