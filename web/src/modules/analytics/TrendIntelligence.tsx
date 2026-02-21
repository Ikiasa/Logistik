'use client';
import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { TREND_DATA } from './intelligence.data';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

type TrendView = 'revenue_cost' | 'utilization' | 'sla';

const VIEWS = [
    { id: 'revenue_cost' as TrendView, label: 'Revenue & Cost' },
    { id: 'utilization' as TrendView, label: 'Utilization' },
    { id: 'sla' as TrendView, label: 'SLA Compliance' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-[10px] space-y-1 shadow-xl">
            <p className="font-black text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
            {payload.map((p: any) => (
                <div key={p.name} className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-zinc-500 dark:text-zinc-400">{p.name}:</span>
                    <span className="font-black text-zinc-900 dark:text-white">
                        {p.name === 'Revenue' || p.name === 'Cost' ? `Rp ${p.value}M` : `${p.value}%`}
                    </span>
                </div>
            ))}
        </div>
    );
};

export const TrendIntelligence: React.FC = () => {
    const [view, setView] = useState<TrendView>('revenue_cost');

    // Calculate trend direction
    const last7 = TREND_DATA.slice(-7);
    const prev7 = TREND_DATA.slice(0, 7);
    const avgRevLast = last7.reduce((s, d) => s + d.revenue, 0) / 7;
    const avgRevPrev = prev7.reduce((s, d) => s + d.revenue, 0) / 7;
    const trendPct = ((avgRevLast - avgRevPrev) / avgRevPrev * 100).toFixed(1);

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center space-x-2 flex-1">
                    <TrendingUp size={16} className="text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white">Trend_Intelligence</h3>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
                        +{trendPct}% 7d
                    </span>
                </div>
                <div className="flex bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 space-x-1 shadow-inner">
                    {VIEWS.map(v => (
                        <button key={v.id} onClick={() => setView(v.id)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${view === v.id ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-400'}`}>
                            {v.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="p-6">
                <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        {view === 'revenue_cost' ? (
                            <AreaChart data={TREND_DATA} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} className="dark:stroke-zinc-900" />
                                <XAxis dataKey="date" tick={{ fill: '#a1a1aa', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#a1a1aa', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}M`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2} fill="url(#gradRevenue)" dot={false} />
                                <Area type="monotone" dataKey="cost" name="Cost" stroke="#f43f5e" strokeWidth={2} fill="url(#gradCost)" dot={false} />
                            </AreaChart>
                        ) : (
                            <LineChart data={TREND_DATA} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} className="dark:stroke-zinc-900" />
                                <XAxis dataKey="date" tick={{ fill: '#a1a1aa', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <YAxis domain={[60, 100]} tick={{ fill: '#a1a1aa', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                                <Tooltip content={<CustomTooltip />} />
                                {view === 'utilization' ? (
                                    <Line type="monotone" dataKey="utilization" name="Utilization" stroke="#10b981" strokeWidth={2.5} dot={false} />
                                ) : (
                                    <Line type="monotone" dataKey="sla" name="SLA" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                                )}
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                </div>

                {/* Mini stats below chart */}
                <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                    {[
                        { label: 'Peak Revenue Day', value: '20 Feb', sub: 'Rp 780M' },
                        { label: 'Avg Daily Rev', value: `Rp ${(TREND_DATA.reduce((s, d) => s + d.revenue, 0) / TREND_DATA.length).toFixed(0)}M`, sub: 'Last 14d' },
                        { label: 'Best SLA Day', value: '96%', sub: '20 Feb' },
                        { label: 'Avg Utilization', value: `${(TREND_DATA.reduce((s, d) => s + d.utilization, 0) / TREND_DATA.length).toFixed(1)}%`, sub: 'Last 14d' },
                    ].map(s => (
                        <div key={s.label} className="text-center">
                            <p className="text-[8px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">{s.label}</p>
                            <p className="text-sm font-black text-zinc-900 dark:text-white mt-0.5">{s.value}</p>
                            <p className="text-[9px] text-zinc-400 dark:text-zinc-600">{s.sub}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
