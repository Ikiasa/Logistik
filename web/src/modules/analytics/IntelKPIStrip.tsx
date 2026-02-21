'use client';
import React, { useState } from 'react';
import { Truck, Zap, BarChart3, DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Target, Receipt } from 'lucide-react';
import { TODAY_KPIS } from './intelligence.data';

type Compare = 'yesterday' | 'week';

function fmt(n: number, prefix = 'Rp ', suffix = '') {
    if (Math.abs(n) >= 1_000_000_000) return `${prefix}${(n / 1_000_000_000).toFixed(1)}B${suffix}`;
    if (Math.abs(n) >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M${suffix}`;
    if (Math.abs(n) >= 1_000) return `${prefix}${(n / 1_000).toFixed(0)}K${suffix}`;
    return `${prefix}${n}${suffix}`;
}

interface KPICardProps {
    icon: React.ElementType;
    label: string;
    value: string;
    deltaD: number;  // vs yesterday
    deltaW: number;  // vs week
    compare: Compare;
    accent: string;
    higherIsBetter?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ icon: Icon, label, value, deltaD, deltaW, compare, accent, higherIsBetter = true }) => {
    const delta = compare === 'yesterday' ? deltaD : deltaW;
    const positive = higherIsBetter ? delta >= 0 : delta <= 0;
    const TrendIcon = delta >= 0 ? ArrowUpRight : ArrowDownRight;
    const trendColor = positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';

    return (
        <div className={`relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm`}>
            {/* Glow */}
            <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-all ${accent}`} />

            <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800`}>
                    <Icon size={16} className="text-zinc-500 dark:text-zinc-400" />
                </div>
                <div className={`flex items-center space-x-1 text-[10px] font-black ${trendColor}`}>
                    <TrendIcon size={12} />
                    <span>{Math.abs(delta).toFixed(1)}{label.includes('%') || label.includes('Util') || label.includes('Margin') || label.includes('SLA') ? 'pp' : '%'}</span>
                </div>
            </div>

            <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] mb-1">{label}</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter font-mono">{value}</p>

            <p className="text-[8px] text-zinc-400 dark:text-zinc-700 font-bold uppercase mt-2">
                vs {compare === 'yesterday' ? 'yesterday' : 'last week'}
            </p>
        </div>
    );
};

export const IntelKPIStrip: React.FC = () => {
    const [compare, setCompare] = useState<Compare>('yesterday');
    const k = TODAY_KPIS;

    const cards: KPICardProps[] = [
        { icon: Truck, label: 'Total Fleet', value: String(k.totalFleet), deltaD: 0, deltaW: 0, compare, accent: 'bg-zinc-400', higherIsBetter: true },
        { icon: Zap, label: 'Active Today', value: `${k.activeToday}/${k.totalFleet}`, deltaD: 1, deltaW: 2, compare, accent: 'bg-emerald-400', higherIsBetter: true },
        { icon: BarChart3, label: 'Utilization %', value: `${k.utilization.toFixed(1)}%`, deltaD: k.vsYesterdayUtilization, deltaW: k.vsWeekUtilization, compare, accent: 'bg-indigo-400', higherIsBetter: true },
        { icon: DollarSign, label: 'Revenue / Fleet', value: fmt(k.revenuePerFleet), deltaD: k.vsYesterdayRevenue, deltaW: k.vsWeekRevenue, compare, accent: 'bg-cyan-400', higherIsBetter: true },
        { icon: Receipt, label: 'Cost / KM', value: fmt(k.costPerKm, 'Rp '), deltaD: k.vsYesterdayCostKm, deltaW: k.vsWeekCostKm, compare, accent: 'bg-amber-400', higherIsBetter: false },
        { icon: Target, label: 'Net Margin %', value: `${k.netMargin.toFixed(1)}%`, deltaD: k.vsYesterdayMargin, deltaW: k.vsWeekMargin, compare, accent: 'bg-emerald-400', higherIsBetter: true },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Executive KPI Strip</p>
                <div className="flex bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 space-x-1 shadow-inner">
                    {(['yesterday', 'week'] as Compare[]).map(c => (
                        <button
                            key={c}
                            onClick={() => setCompare(c)}
                            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${compare === c ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-400'}`}
                        >
                            vs {c === 'yesterday' ? 'Yesterday' : 'Last Week'}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {cards.map(c => <KPICard key={c.label} {...c} />)}
            </div>
        </div>
    );
};
