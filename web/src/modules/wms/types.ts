export type InventoryStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'RESERVED';

export interface Location {
    zone: string;
    rack: string;
    bin: string;
}

export interface InventoryItem {
    id: string;
    sku: string;
    name: string;
    description?: string;
    category: string;
    location: Location;
    quantity: number;
    threshold: number;
    unit: string;
    status: InventoryStatus;
    lastRestockedAt: string;
    weight?: number;
    dimensions?: string;
    reorderPoint: number;
    occupancyRate?: number;
}

export interface StockMovement {
    id: string;
    itemId: string;
    itemName: string;
    type: 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT' | 'TRANSFER' | 'PICKING';
    quantity: number;
    timestamp: string;
    performedBy: string;
    referenceId?: string;
}

export interface InboundShipment {
    id: string;
    reference: string;
    origin: string;
    status: 'ASN' | 'PENDING' | 'RECEIVING' | 'QC' | 'COMPLETED';
    expectedDate: string;
    items: { sku: string; quantity: number }[];
}

export interface PickingTask {
    id: string;
    orderId: string;
    priority: 'URGENT' | 'HIGH' | 'NORMAL';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    assignedTo?: string;
    zone: string;
    itemsCount: number;
}

export interface WarehouseZone {
    id: string;
    name: string;
    capacity: number;
    occupancy: number;
    type: 'COLD' | 'DRY' | 'HAZMAT' | 'GENERAL';
}
