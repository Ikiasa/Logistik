'use client';

import React from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Shipment, ShipmentStatus } from './types';

const statusVariants: Record<ShipmentStatus, any> = {
    CREATED: 'info',
    ASSIGNED: 'indigo',
    PICKED_UP: 'warning',
    IN_TRANSIT: 'warning',
    DELIVERED: 'success',
    CLOSED: 'default',
    CANCELLED: 'error',
};

const mockShipments: Shipment[] = [
    {
        id: '1',
        trackingNumber: 'TRK-982341',
        customerName: 'Global Corp A',
        origin: 'Jakarta, ID',
        destination: 'Surabaya, ID',
        status: 'IN_TRANSIT',
        weightKg: 450,
        volumeCbm: 2.4,
        revenueCents: 125000,
        costCents: 85000,
        marginCents: 40000,
        stops: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tenantId: 'tenant-1'
    },
    {
        id: '2',
        trackingNumber: 'TRK-982342',
        customerName: 'Industries B',
        origin: 'Bandung, ID',
        destination: 'Medan, ID',
        status: 'DELIVERED',
        weightKg: 1200,
        volumeCbm: 8.5,
        revenueCents: 450000,
        costCents: 310000,
        marginCents: 140000,
        stops: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tenantId: 'tenant-1'
    }
];

export const ShipmentTable: React.FC = () => {
    return (
        <DataTable<Shipment>
            title="All Shipments"
            data={mockShipments}
            columns={[
                {
                    header: 'Tracking #',
                    accessor: (item) => (
                        <div className="flex flex-col">
                            <span className="font-black text-zinc-900 dark:text-zinc-200 font-mono tracking-tight">{item.trackingNumber}</span>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest">{item.id.slice(0, 8)}</span>
                        </div>
                    ),
                    className: 'w-40'
                },
                {
                    header: 'Status',
                    accessor: (item) => (
                        <Badge variant={statusVariants[item.status]}>
                            {item.status.replace('_', ' ')}
                        </Badge>
                    )
                },
                {
                    header: 'Customer',
                    accessor: 'customerName',
                    className: 'text-zinc-500 dark:text-zinc-400 font-bold'
                },
                {
                    header: 'Origin → Destination',
                    accessor: (item) => (
                        <div className="flex items-center text-xs font-bold">
                            <span className="text-zinc-600 dark:text-zinc-300">{item.origin}</span>
                            <span className="mx-2 text-zinc-300 dark:text-zinc-700 font-black">→</span>
                            <span className="text-zinc-600 dark:text-zinc-300">{item.destination}</span>
                        </div>
                    )
                },
                {
                    header: 'Pricing',
                    accessor: (item) => (
                        <div className="text-right font-mono">
                            <p className="text-zinc-900 dark:text-zinc-200 font-black">${(item.revenueCents / 100).toFixed(2)}</p>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-black uppercase tracking-widest">+${(item.marginCents / 100).toFixed(2)}</p>
                        </div>
                    ),
                    className: 'text-right'
                }
            ]}
        />
    );
};
