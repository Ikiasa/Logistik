'use client';

import React from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Vehicle, VehicleStatus } from './types';
import { Wrench, Gauge, Calendar } from 'lucide-react';

const statusVariants: Record<VehicleStatus, any> = {
    AVAILABLE: 'success',
    IN_USE: 'indigo',
    MAINTENANCE: 'warning',
    OUT_OF_SERVICE: 'error',
};

export const mockVehicles: Vehicle[] = [
    {
        id: 'v-1',
        plateNumber: 'B 1234 ABC',
        model: 'Scania R450',
        type: 'HEAVY_TRUCK',
        status: 'IN_USE',
        lastMaintenance: '2026-01-10',
        nextMaintenance: '2026-04-10',
        mileage: 42500,
        assignedDriverId: 'd-1'
    },
    {
        id: 'v-2',
        plateNumber: 'B 5678 DEF',
        model: 'Isuzu Elf',
        type: 'LIGHT_TRUCK',
        status: 'AVAILABLE',
        lastMaintenance: '2026-02-01',
        nextMaintenance: '2026-05-01',
        mileage: 12800
    },
    {
        id: 'v-3',
        plateNumber: 'B 9012 GHI',
        model: 'Mercedes-Benz Actros',
        type: 'HEAVY_TRUCK',
        status: 'MAINTENANCE',
        lastMaintenance: '2025-11-20',
        nextMaintenance: '2026-02-15',
        mileage: 89000
    }
];

interface VehicleTableProps {
    vehicles?: Vehicle[];
}

export const VehicleTable: React.FC<VehicleTableProps> = ({ vehicles = mockVehicles }) => {
    return (
        <DataTable<Vehicle>
            title="Fleet Inventory"
            data={vehicles}
            columns={[
                {
                    header: 'Plate / Model',
                    accessor: (item) => (
                        <div className="flex flex-col">
                            <span className="font-bold text-zinc-200 font-mono text-xs">{item.plateNumber}</span>
                            <span className="text-sm text-zinc-400 font-medium">{item.model}</span>
                        </div>
                    ),
                    className: 'w-64'
                },
                {
                    header: 'Type',
                    accessor: (item) => (
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                            {item.type.replace('_', ' ')}
                        </span>
                    )
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
                    header: 'Health & Stats',
                    accessor: (item) => (
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center text-xs text-zinc-400">
                                <Gauge size={14} className="mr-1.5 text-zinc-600" />
                                <span className="font-mono">{item.mileage.toLocaleString()} KM</span>
                            </div>
                            <div className="flex items-center text-xs text-zinc-400">
                                <Wrench size={14} className="mr-1.5 text-zinc-600" />
                                <span className={`font-mono ${new Date(item.nextMaintenance) < new Date() ? 'text-red-500' : ''
                                    }`}>
                                    {item.nextMaintenance}
                                </span>
                            </div>
                        </div>
                    )
                }
            ]}
        />
    );
};
