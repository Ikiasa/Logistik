'use client';

import React from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { InventoryItem, InventoryStatus } from './types';

const statusVariants: Record<InventoryStatus, any> = {
    IN_STOCK: 'success',
    LOW_STOCK: 'warning',
    OUT_OF_STOCK: 'error',
    RESERVED: 'indigo',
};

const mockInventory: InventoryItem[] = [
    {
        id: 'inv-1',
        sku: 'SKU-LOG-001',
        name: 'Heavy Duty Pallet',
        category: 'Storage',
        location: { zone: 'A', rack: 'A-102', bin: 'B-05' },
        quantity: 150,
        threshold: 20,
        reorderPoint: 30,
        unit: 'pcs',
        status: 'IN_STOCK',
        lastRestockedAt: new Date().toISOString()
    },
    {
        id: 'inv-2',
        sku: 'SKU-PKG-042',
        name: 'Wrapping Film 50cm',
        category: 'Packaging',
        location: { zone: 'B', rack: 'B-201', bin: 'C-12' },
        quantity: 8,
        threshold: 15,
        reorderPoint: 20,
        unit: 'rolls',
        status: 'LOW_STOCK',
        lastRestockedAt: new Date().toISOString()
    },
    {
        id: 'inv-3',
        sku: 'SKU-SF-099',
        name: 'Forklift Spare Tire',
        category: 'Maintenance',
        location: { zone: 'M', rack: 'M-500', bin: 'A-01' },
        quantity: 0,
        threshold: 2,
        reorderPoint: 3,
        unit: 'pcs',
        status: 'OUT_OF_STOCK',
        lastRestockedAt: new Date().toISOString()
    }
];

export const InventoryTable: React.FC = () => {
    return (
        <DataTable<InventoryItem>
            title="Warehouse Inventory"
            data={mockInventory}
            columns={[
                {
                    header: 'SKU / Item',
                    accessor: (item) => (
                        <div className="flex flex-col">
                            <span className="font-bold text-zinc-200 font-mono text-xs">{item.sku}</span>
                            <span className="text-sm text-zinc-400 font-medium">{item.name}</span>
                        </div>
                    ),
                    className: 'w-64'
                },
                {
                    header: 'Category',
                    accessor: 'category',
                    className: 'text-zinc-500 text-xs font-bold uppercase tracking-wider'
                },
                {
                    header: 'Location',
                    accessor: (item) => (
                        <div className="flex items-center space-x-1 font-mono text-zinc-300">
                            <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[10px]">{item.location.rack}</span>
                            <span className="text-zinc-700">/</span>
                            <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[10px]">{item.location.bin}</span>
                        </div>
                    )
                },
                {
                    header: 'Stock Level',
                    accessor: (item) => (
                        <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-widest uppercase border ${item.quantity < 20
                                ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                }`}>
                                {item.quantity} {item.unit}
                            </span>
                        </div>
                    )
                },
                {
                    header: 'Status',
                    accessor: (item) => (
                        <Badge variant={statusVariants[item.status]}>
                            {item.status.replace('_', ' ')}
                        </Badge>
                    )
                }
            ]}
        />
    );
};
