export type ShipmentStatus =
    | 'CREATED'
    | 'ASSIGNED'
    | 'PICKED_UP'
    | 'IN_TRANSIT'
    | 'DELIVERED'
    | 'CLOSED'
    | 'CANCELLED';

export interface Stop {
    id: string;
    type: 'PICKUP' | 'DROPOFF' | 'TRANSIT';
    locationName: string;
    address: string;
    sequence: number;
    expectedArrival: string;
    actualArrival?: string;
}

export interface Shipment {
    id: string;
    trackingNumber: string;
    status: ShipmentStatus;
    customerName: string;
    origin: string;
    destination: string;
    weightKg: number;
    volumeCbm: number;
    revenueCents: number;
    costCents: number;
    marginCents: number;
    stops: Stop[];
    createdAt: string;
    updatedAt: string;
    tenantId: string;
}
