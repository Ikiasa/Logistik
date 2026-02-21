import { InventoryItem, InboundShipment, PickingTask, WarehouseZone } from './types';

export const MOCK_WAREHOUSE_STATS = {
    totalSkus: 1240,
    lowStockCount: 12,
    pendingInbound: 5,
    activePickingTasks: 8,
    occupancyRate: 78.4,
    vsYesterdayLowStock: -2,
    vsYesterdayInbound: 1,
    vsYesterdayPicking: 3,
    vsYesterdayOccupancy: 0.5,
};

export const MOCK_ZONES: WarehouseZone[] = [
    { id: 'z1', name: 'Zone A (Cold)', capacity: 500, occupancy: 420, type: 'COLD' },
    { id: 'z2', name: 'Zone B (Dry)', capacity: 2000, occupancy: 1560, type: 'DRY' },
    { id: 'z3', name: 'Zone C (Hazmat)', capacity: 100, occupancy: 45, type: 'HAZMAT' },
    { id: 'z4', name: 'Zone D (General)', capacity: 1500, occupancy: 1200, type: 'GENERAL' },
];

export const MOCK_INVENTORY_BRAIN: InventoryItem[] = [
    {
        id: 'inv-1',
        sku: 'SKU-LOG-001',
        name: 'Heavy Duty Pallet',
        category: 'Storage',
        location: { zone: 'Zone B', rack: 'A-102', bin: 'B-05' },
        quantity: 150,
        threshold: 20,
        unit: 'pcs',
        status: 'IN_STOCK',
        lastRestockedAt: new Date().toISOString(),
        weight: 25,
        dimensions: '120x100x15cm',
        reorderPoint: 50,
        occupancyRate: 85
    },
    {
        id: 'inv-2',
        sku: 'SKU-PKG-042',
        name: 'Wrapping Film 50cm',
        category: 'Packaging',
        location: { zone: 'Zone B', rack: 'B-201', bin: 'C-12' },
        quantity: 8,
        threshold: 15,
        unit: 'rolls',
        status: 'LOW_STOCK',
        lastRestockedAt: new Date().toISOString(),
        weight: 2,
        dimensions: '50cm x 300m',
        reorderPoint: 20,
        occupancyRate: 40
    },
    {
        id: 'inv-3',
        sku: 'SKU-SF-099',
        name: 'Forklift Spare Tire',
        category: 'Maintenance',
        location: { zone: 'Zone D', rack: 'M-500', bin: 'A-01' },
        quantity: 0,
        threshold: 2,
        unit: 'pcs',
        status: 'OUT_OF_STOCK',
        lastRestockedAt: new Date().toISOString(),
        weight: 45,
        dimensions: '60cm x 60cm',
        reorderPoint: 1,
        occupancyRate: 10
    }
];

export const MOCK_INBOUND_SHIPMENTS: InboundShipment[] = [
    {
        id: 'in-1',
        reference: 'ASN-88291',
        origin: 'Supplier Alpha',
        status: 'ASN',
        expectedDate: new Date(Date.now() + 86400000).toISOString(),
        items: [{ sku: 'SKU-LOG-001', quantity: 100 }]
    },
    {
        id: 'in-2',
        reference: 'ASN-88302',
        origin: 'Logistik Hub Beta',
        status: 'QC',
        expectedDate: new Date().toISOString(),
        items: [{ sku: 'SKU-PKG-042', quantity: 50 }]
    }
];

export const MOCK_PICKING_TASKS: PickingTask[] = [
    { id: 'pk-1', orderId: 'ORD-9901', priority: 'URGENT', status: 'IN_PROGRESS', assignedTo: 'John Doe', zone: 'Zone B', itemsCount: 12 },
    { id: 'pk-2', orderId: 'ORD-9905', priority: 'NORMAL', status: 'PENDING', zone: 'Zone D', itemsCount: 5 },
];
