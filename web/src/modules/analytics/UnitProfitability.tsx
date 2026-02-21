'use client';
import React, { useState } from 'react';
import { DollarSign, Truck, User, Map } from 'lucide-react';
import { FLEET_UNITS, FleetUnit } from './intelligence.data';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type ViewMode = 'truck' | 'driver' | 'route';

function fmtRp(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return String(n);
}

const ROUTE_DATA = [
    { name: 'JKT→BDG', revenue: 32_000_000, cost: 18_500_000, margin: 42.2 },
    { name: 'BDG→SMR', revenue: 54_000_000, cost: 34_100_000, margin: 36.9 },
    { name: 'JKT→SBY', revenue: 71_000_000, cost: 46_200_000, margin: 34.9 },
    { name: 'SMR→YOG', revenue: 28_000_000, cost: 19_400_000, margin: 30.7 },
    { name: 'JKT→MDN', revenue: 82_000_000, cost: 59_800_000, margin: 27.1 },
    { name: 'MKS→SBY', revenue: 44_000_000, cost: 33_700_000, margin: 23.4 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-[10px] shadow-xl">
            <p className="font-black text-zinc-900 dark:text-white mb-1">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.fill || p.color }} className="font-bold">
                    {p.name}: {p.name === 'Margin' ? `${p.value}%` : `Rp ${fmtRp(p.value)}`}
                </p>
            ))}
        </div>
    );
};

export const UnitProfitability: React.FC = () => {
    const [view, setView] = useState<ViewMode>('truck');

    const truckData = [...FLEET_UNITS]
        .sort((a, b) => b.margin - a.margin)
        .slice(0, 10)
        .map(u => ({ name: u.plate.split(' ').slice(-1)[0], revenue: u.revenue, cost: u.cost, margin: u.margin }));

    const driverData = [...FLEET_UNITS]
        .sort((a, b) => b.margin - a.margin)
        .slice(0, 10)
        .map(u => ({ name: u.driver.split(' ')[0], revenue: u.revenue, cost: u.cost, margin: u.margin }));

    const chartData = view === 'truck' ? truckData : view === 'driver' ? driverData : ROUTE_DATA.map(r => ({ ...r, name: r.name }));

    const VIEWS = [
        { id: 'truck' as ViewMode, icon: Truck, label: 'Truck' },
        { id: 'driver' as ViewMode, icon: User, label: 'Driver' },
        { id: 'route' as ViewMode, icon: Map, label: 'Route' },
    ];

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center space-x-2">
                    <DollarSign size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white">Unit_Profitability</h3>
                </div>
                <div className="flex bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 space-x-1 shadow-inner">
                    {VIEWS.map(v => (
                        <button key={v.id} onClick={() => setView(v.id)}
                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${view === v.id ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-400'}`}>
                            <v.icon size={11} />
                            <span>{v.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Revenue vs Cost bar chart */}
            <div className="p-6">
                <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-4">Revenue vs Cost — by {view}</p>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={1}>
                            <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={v => `${fmtRp(v)}`} tick={{ fill: '#a1a1aa', fontSize: 8 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', opacity: 0.05 }} />
                            <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={20} />
                            <Bar dataKey="cost" name="Cost" fill="#d4d4d8" radius={[3, 3, 0, 0]} maxBarSize={20} className="dark:fill-zinc-700" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Margin strip */}
                <div className="mt-4">
                    <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-2">Margin %</p>
                    <div className="space-y-1.5">
                        {chartData.slice(0, 6).map((d, i) => (
                            <div key={i} className="flex items-center space-x-3">
                                <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-600 w-16 truncate">{d.name}</span>
                                <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{
                                            width: `${Math.max(0, d.margin)}%`,
                                            backgroundColor: d.margin < 0 ? '#ef4444' : d.margin < 20 ? '#f59e0b' : '#10b981',
                                        }}
                                    />
                                </div>
                                <span className={`text-[9px] font-black w-12 text-right ${d.margin < 0 ? 'text-rose-600 dark:text-rose-400' : d.margin < 20 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                    {d.margin.toFixed(1)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
