'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Cell } from 'recharts';
import { TrendingUp, Award, Star } from 'lucide-react';

const DRIVERS = [
    { name: 'Cahyo P.', deliveries: 47, onTime: 96, safety: 94, fuel: 88 },
    { name: 'Andi W.', deliveries: 42, onTime: 99, safety: 97, fuel: 92 },
    { name: 'Budi S.', deliveries: 38, onTime: 91, safety: 89, fuel: 85 },
    { name: 'Deni F.', deliveries: 35, onTime: 88, safety: 85, fuel: 90 },
    { name: 'Eko P.', deliveries: 28, onTime: 94, safety: 92, fuel: 87 },
];

const FLEET_KPIs = [
    { name: 'Utilization', value: 78, fill: '#6366f1' },
    { name: 'On-Time', value: 94, fill: '#10b981' },
    { name: 'SLA', value: 96, fill: '#f59e0b' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-[10px] shadow-lg">
            <p className="font-black text-zinc-900 dark:text-white mb-1">{label}</p>
            {payload.map((p: any) => (
                <p key={p.dataKey} style={{ color: p.fill }} className="font-bold">{p.name}: {p.value}</p>
            ))}
        </div>
    );
};

export const PerformanceSnapshot: React.FC = () => {
    const topDriver = DRIVERS.reduce((best, d) => d.onTime > best.onTime ? d : best, DRIVERS[0]);

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center space-x-3">
                    <TrendingUp size={16} className="text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white">Performance_Snapshot</h2>
                </div>
                <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest border border-zinc-100 dark:border-zinc-800 px-2 py-0.5 rounded-full">Today</span>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Driver comparison bar chart */}
                <div className="lg:col-span-3">
                    <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-4">Driver On-Time Rate (%)</p>
                    <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={DRIVERS} margin={{ top: 0, right: 0, left: -28, bottom: 0 }} barGap={4}>
                                <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <YAxis domain={[80, 100]} tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                                <Bar dataKey="onTime" name="On-Time" radius={[4, 4, 0, 0]}>
                                    {DRIVERS.map((d, i) => (
                                        <Cell key={i} fill={d.name === topDriver.name ? '#10b981' : '#d4d4d8'} className="dark:fill-[#3f3f46]" />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Fleet radial KPIs */}
                <div className="lg:col-span-2">
                    <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-4">Fleet KPIs</p>
                    <div className="space-y-3">
                        {FLEET_KPIs.map(kpi => (
                            <div key={kpi.name} className="flex items-center space-x-3">
                                <span className="text-[9px] font-black text-zinc-500 uppercase w-20">{kpi.name}</span>
                                <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${kpi.value}%`, backgroundColor: kpi.fill }} />
                                </div>
                                <span className="text-xs font-black text-zinc-900 dark:text-white w-10 text-right">{kpi.value}%</span>
                            </div>
                        ))}
                    </div>

                    {/* Top performer card */}
                    <div className="mt-5 p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl">
                        <div className="flex items-center space-x-2 mb-1">
                            <Star size={12} className="text-amber-500 dark:text-amber-400" />
                            <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Top Performer</span>
                        </div>
                        <p className="text-sm font-black text-zinc-900 dark:text-white">{topDriver.name}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{topDriver.onTime}% on-time · {topDriver.deliveries} deliveries</p>
                    </div>
                </div>
            </div>

            {/* Delivery count mini table */}
            <div className="border-t border-zinc-100 dark:border-zinc-900 px-6 py-4">
                <div className="grid grid-cols-5 gap-2">
                    {DRIVERS.map(d => (
                        <div key={d.name} className="text-center">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 flex items-center justify-center mx-auto mb-1">
                                <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400">{d.name.charAt(0)}</span>
                            </div>
                            <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 truncate">{d.name.split(' ')[0]}</p>
                            <p className="text-xs font-black text-zinc-900 dark:text-white">{d.deliveries}</p>
                            <p className="text-[8px] text-zinc-300 dark:text-zinc-700">deliveries</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
