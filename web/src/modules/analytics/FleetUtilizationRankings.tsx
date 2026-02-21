
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Truck, TrendingUp, Clock } from 'lucide-react';

export const FleetUtilizationRankings: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUtilization = async () => {
            try {
                const res = await api.get('/analytics/ops/utilization');
                setData(res.data);
            } catch (err) {
                console.error('Failed to fetch utilization rankings', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUtilization();
    }, []);

    if (loading) return (
        <div className="h-64 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950/50 rounded-3xl border border-zinc-100 dark:border-zinc-800">
            <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 dark:border-t-indigo-400 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full"></div>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-1">ASSET_PERFORMANCE</h3>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter">Fleet Utilization Ranking</h2>
                </div>
                <div className="p-2 bg-indigo-500/10 rounded-xl">
                    <TrendingUp size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.slice(0, 5)} layout="vertical" margin={{ left: -20, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-100 dark:text-zinc-900" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="vehicleId"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 800 }}
                            width={80}
                            tickFormatter={(val) => `ID ${val.slice(0, 4).toUpperCase()}`}
                        />
                        <Tooltip
                            cursor={{ fill: 'currentColor', className: 'text-zinc-50 dark:text-zinc-900', opacity: 0.4 } as any}
                            contentStyle={{ background: 'var(--tooltip-bg, #fff)', border: '1px solid var(--tooltip-border, #f4f4f5)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: 'var(--tooltip-text, #18181b)', fontSize: '10px', fontWeight: 'bold' }}
                            labelStyle={{ color: 'var(--tooltip-text, #18181b)', fontWeight: 'black', marginBottom: '4px' }}
                            wrapperClassName="dark:[--tooltip-text:#fff]"
                        />
                        <Bar dataKey="utilization" radius={[0, 4, 4, 0]} barSize={20}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.utilization > 70 ? '#10b981' : entry.utilization > 40 ? '#6366f1' : '#f59e0b'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 space-y-3">
                {data.slice(0, 3).map((v, i) => (
                    <div key={v.vehicleId} className="p-4 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex items-center justify-between group-hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${v.utilization > 70 ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                                <Truck size={14} className={v.utilization > 70 ? 'text-emerald-600 dark:text-emerald-500' : 'text-amber-600 dark:text-amber-500'} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-tighter">UNIT-{v.vehicleId.slice(0, 4).toUpperCase()}</p>
                                <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1">
                                    <span className="text-emerald-600 dark:text-emerald-500">{v.activeHours}h Active</span>
                                    <span className="mx-2">|</span>
                                    <span className="text-zinc-400 dark:text-zinc-600">{v.idleHours}h Idle</span>
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`text-sm font-black ${v.utilization > 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{v.utilization}%</p>
                            <p className="text-[8px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">PRODUCTIVITY</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
