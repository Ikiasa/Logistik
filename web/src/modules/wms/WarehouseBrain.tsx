'use client';
import React, { useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Search, Filter, Layers, MoreHorizontal, ArrowRight } from 'lucide-react';
import { InventoryItem, InventoryStatus } from './types';
import { MOCK_INVENTORY_BRAIN } from './wms.data';

const statusVariants: Record<InventoryStatus, any> = {
    IN_STOCK: 'success',
    LOW_STOCK: 'warning',
    OUT_OF_STOCK: 'error',
    RESERVED: 'indigo',
};

export const WarehouseBrain: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = MOCK_INVENTORY_BRAIN.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-100/50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/50">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search SKU, item name, or location..."
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-xl text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors shadow-sm">
                        <Filter size={14} />
                        <span>Filters</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors border-none shadow-[0_0_20px_rgba(79,70,229,0.2)]">
                        <Layers size={14} />
                        <span>Direct Adjustment</span>
                    </button>
                </div>
            </div>

            <DataTable<InventoryItem>
                data={filteredData}
                columns={[
                    {
                        header: 'Item Intelligence',
                        accessor: (item) => (
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg flex items-center justify-center">
                                    <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600">{item.sku.split('-').pop()}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-zinc-900 dark:text-white">{item.name}</span>
                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono tracking-tighter">{item.sku}</span>
                                </div>
                            </div>
                        ),
                        className: 'w-72'
                    },
                    {
                        header: 'Location / Rack',
                        accessor: (item) => (
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{item.location.zone}</span>
                                <div className="flex items-center space-x-1 font-mono text-zinc-400 text-xs">
                                    <span>{item.location.rack}</span>
                                    <span className="text-zinc-700">/</span>
                                    <span>{item.location.bin}</span>
                                </div>
                            </div>
                        )
                    },
                    {
                        header: 'Current Stock',
                        accessor: (item) => (
                            <div className="flex flex-col items-center">
                                <span className={`text-sm font-black ${item.quantity <= item.threshold ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {item.quantity} {item.unit}
                                </span>
                                <div className="w-20 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-1 overflow-hidden shadow-inner">
                                    <div
                                        className={`h-full ${item.quantity <= item.threshold ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${Math.min((item.quantity / (item.reorderPoint * 2)) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        )
                    },
                    {
                        header: 'Utilization',
                        accessor: (item) => (
                            <div className="flex items-center space-x-2">
                                <Badge variant={item.occupancyRate! > 80 ? 'error' : 'indigo'}>
                                    {item.occupancyRate}% Vol
                                </Badge>
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
                    },
                    {
                        header: '',
                        accessor: () => (
                            <button className="p-2 text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                <MoreHorizontal size={16} />
                            </button>
                        ),
                        className: 'w-10 text-right'
                    }
                ]}
            />
        </div>
    );
};
