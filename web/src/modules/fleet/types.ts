export type VehicleStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
export type DriverStatus = 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'OFF_DUTY';

export interface Vehicle {
    id: string;
    plateNumber: string;
    model: string;
    type: 'HEAVY_TRUCK' | 'LIGHT_TRUCK' | 'VAN' | 'MOTORCYCLE';
    status: VehicleStatus;
    lastMaintenance: string;
    nextMaintenance: string;
    mileage: number;
    assignedDriverId?: string;
}

export interface Driver {
    id: string;
    name: string;
    email: string;
    phone: string;
    licenseNumber: string;
    licenseExpiry: string;
    status: DriverStatus;
    rating: number; // 0.0 - 5.0
    totalDeliveries: number;
    avatarUrl?: string;
}

export interface MaintenanceRecord {
    id: string;
    vehicleId: string;
    type: 'ROUTINE' | 'REPAIR' | 'INSPECTION';
    description: string;
    costCents: number;
    date: string;
    performedBy: string;
}
