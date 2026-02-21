'use client';
import React from 'react';
import { Package, AlertTriangle, Ship, PackageCheck, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { MOCK_WAREHOUSE_STATS } from './wms.data';

interface KPICardProps {
    icon: React.ElementType;
    label: string;
    value: string;
    delta: number;
    accent: string;
    higherIsBetter?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ icon: Icon, label, value, delta, accent, higherIsBetter = true }) => {
    const positive = higherIsBetter ? delta >= 0 : delta <= 0;
    const TrendIcon = delta >= 0 ? ArrowUpRight : ArrowDownRight;
    const trendColor = positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';

    return (
        <div className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm">
            <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-all ${accent}`} />

            <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                    <Icon size={16} className="text-zinc-500 dark:text-zinc-400" />
                </div>
                {delta !== 0 && (
                    <div className={`flex items-center space-x-1 text-[10px] font-black ${trendColor}`}>
                        <TrendIcon size={12} />
                        <span>{Math.abs(delta)}{label.includes('%') ? 'pp' : ''}</span>
                    </div>
                )}
            </div>

            <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] mb-1">{label}</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter font-mono">{value}</p>

            <p className="text-[8px] text-zinc-400 dark:text-zinc-700 font-bold uppercase mt-2">
                Last 24 Hours
            </p>
        </div>
    );
};

export const WarehouseKPIStrip: React.FC = () => {
    const s = MOCK_WAREHOUSE_STATS;

    const cards: KPICardProps[] = [
        { icon: Package, label: 'Total SKUs', value: String(s.totalSkus), delta: 0, accent: 'bg-zinc-400' },
        { icon: AlertTriangle, label: 'Low Stock', value: String(s.lowStockCount), delta: s.vsYesterdayLowStock, accent: 'bg-rose-400', higherIsBetter: false },
        { icon: Ship, label: 'Pending Inbound', value: String(s.pendingInbound), delta: s.vsYesterdayInbound, accent: 'bg-indigo-400' },
        { icon: PackageCheck, label: 'Active Picking', value: String(s.activePickingTasks), delta: s.vsYesterdayPicking, accent: 'bg-emerald-400' },
        { icon: Activity, label: 'Occupancy %', value: `${s.occupancyRate.toFixed(1)}%`, delta: s.vsYesterdayOccupancy, accent: 'bg-cyan-400' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            {cards.map(c => <KPICard key={c.label} {...c} />)}
        </div>
    );
};
