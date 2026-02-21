'use client';
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface SLAData {
    totalShipments: number;
    onTime: number;
    late: number;
    onTimeRate: number;
    avgDelay: number;
}

interface TrendPoint {
    week: string;
    onTimeRate: number;
}

export const SLAPerformanceCard: React.FC = () => {
    const [data, setData] = useState<SLAData | null>(null);
    const [trends, setTrends] = useState<TrendPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [slaRes, trendRes] = await Promise.all([
                    api.get('/analytics/ops/sla'),
                    api.get('/analytics/ops/sla-trends'),
                ]);
                setData(slaRes.data);
                setTrends(trendRes.data || []);
            } catch (err) {
                console.error('Failed to fetch SLA data', err);
                // Use fallback demo data so the chart still renders
                setTrends([
                    { week: 'W1', onTimeRate: 94 },
                    { week: 'W2', onTimeRate: 96 },
                    { week: 'W3', onTimeRate: 95 },
                    { week: 'W4', onTimeRate: 97 },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm overflow-hidden group">
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl -mr-8 -mt-8 rounded-full pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <Clock size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white">
                        SLA_Performance
                    </h3>
                </div>
                <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest border border-zinc-100 dark:border-zinc-900 px-2 py-0.5 rounded-full">
                    Live
                </span>
            </div>

            {/* Stats row */}
            {loading ? (
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-14 bg-zinc-900 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-3 border border-zinc-100 dark:border-zinc-800 shadow-inner dark:shadow-none">
                        <div className="flex items-center space-x-2 mb-1">
                            <CheckCircle size={12} className="text-emerald-600 dark:text-emerald-400" />
                            <p className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 dark:text-zinc-500">On Time</p>
                        </div>
                        <p className="text-xl font-black text-zinc-900 dark:text-white">
                            {data ? `${data.onTimeRate?.toFixed(1) ?? '--'}%` : '—'}
                        </p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-3 border border-zinc-100 dark:border-zinc-800 shadow-inner dark:shadow-none">
                        <div className="flex items-center space-x-2 mb-1">
                            <AlertCircle size={12} className="text-rose-600 dark:text-rose-400" />
                            <p className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 dark:text-zinc-500">Late</p>
                        </div>
                        <p className="text-xl font-black text-zinc-900 dark:text-white">
                            {data ? data.late ?? 0 : '—'}
                        </p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-3 border border-zinc-100 dark:border-zinc-800 col-span-2 shadow-inner dark:shadow-none">
                        <div className="flex items-center space-x-2 mb-1">
                            <Clock size={12} className="text-amber-600 dark:text-amber-400" />
                            <p className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 dark:text-zinc-500">Avg Delay</p>
                        </div>
                        <p className="text-xl font-black text-zinc-900 dark:text-white">
                            {data ? `${data.avgDelay?.toFixed(0) ?? 0}h` : '—'}
                        </p>
                    </div>
                </div>
            )}

            {/* Trend chart */}
            <div className="mt-2">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center">
                        <TrendingUp size={12} className="mr-2 text-indigo-600 dark:text-indigo-500" />
                        Performance_Trend
                    </p>
                    <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest border border-zinc-100 dark:border-zinc-900 px-2 py-0.5 rounded-full">
                        Last 4 Weeks
                    </span>
                </div>
                {/* min-h ensures ResponsiveContainer always has positive dimensions */}
                <div className="min-h-[128px] w-full">
                    <ResponsiveContainer width="100%" height={128}>
                        <AreaChart data={trends} margin={{ top: 4, right: 0, left: -32, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="week"
                                tick={{ fill: '#a1a1aa', fontSize: 9, fontWeight: 700 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                domain={[80, 100]}
                                tick={{ fill: '#a1a1aa', fontSize: 9 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ stroke: 'currentColor', className: 'text-zinc-100 dark:text-zinc-800', strokeWidth: 1 } as any}
                                contentStyle={{
                                    background: 'var(--tooltip-bg, #fff)',
                                    border: '1px solid var(--tooltip-border, #f4f4f5)',
                                    borderRadius: '12px',
                                    fontSize: '10px',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                }}
                                itemStyle={{ color: 'var(--tooltip-text, #18181b)', fontWeight: 'bold' }}
                                wrapperClassName="dark:[--tooltip-text:#fff]"
                                formatter={(v: any) => [`${v}%`, 'On-Time Rate']}
                            />
                            <Area
                                type="monotone"
                                dataKey="onTimeRate"
                                stroke="#10b981"
                                fillOpacity={1}
                                fill="url(#colorRate)"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, fill: '#10b981' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
