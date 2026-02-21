'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Zap, Clock, DollarSign, Activity, BarChart3 } from 'lucide-react';
import { KPI } from '@/components/ui/KPI';
import { Badge } from '@/components/ui/Badge';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

export const UtilizationDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            try {
                const token = `mock-jwt|${user.id}|${user.tenantId}|${user.email}`;
                const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
                const end = new Date().toISOString();
                const response = await axios.get(`http://localhost:3000/api/ops/analytics/utilization?start=${start}&end=${end}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch utilization stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user]);

    if (loading) return <div className="h-64 flex items-center justify-center text-zinc-500 font-mono">CALCULATING_FLEET_INTELLIGENCE...</div>;

    const aggregate = stats.reduce((acc, curr) => ({
        totalKm: acc.totalKm + Number(curr.total_km || 0),
        totalHours: acc.totalHours + Number(curr.total_hours || 0),
        totalRevenue: acc.totalRevenue + Number(curr.total_revenue || 0),
        totalIdleCost: acc.totalIdleCost + Number(curr.idle_cost_estimation || 0)
    }), { totalKm: 0, totalHours: 0, totalRevenue: 0, totalIdleCost: 0 });

    const avgUtilization = stats.length > 0 ? (stats.reduce((acc, curr) => acc + curr.utilization_rate, 0) / stats.length) : 0;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPI
                    title="Fleet_Utilization"
                    value={`${avgUtilization.toFixed(1)}%`}
                    icon={Activity}
                    trend={{ value: 8.2, isUp: true }}
                    description="Avg. operation time vs theoretical capacity."
                />
                <KPI
                    title="Revenue_Per_KM"
                    value={`$${(aggregate.totalRevenue / (aggregate.totalKm || 1)).toFixed(2)}`}
                    icon={DollarSign}
                    trend={{ value: 1.4, isUp: true }}
                    description="Efficiency of distance vs earnings."
                />
                <KPI
                    title="Total_Idle_Waste"
                    value={`$${aggregate.totalIdleCost.toLocaleString()}`}
                    icon={TrendingDown}
                    trend={{ value: 12, isUp: false }}
                    description="Estimated loss due to vessel inactivity."
                />
                <KPI
                    title="Revenue_Per_Vehicle"
                    value={`$${(aggregate.totalRevenue / (stats.length || 1)).toLocaleString()}`}
                    icon={Zap}
                    trend={{ value: 4.5, isUp: true }}
                    description="Gross yield per active operational unit."
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <BarChart3 size={18} className="text-indigo-400" />
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Utilization_Matrix</h3>
                        </div>
                        <Badge variant="indigo">Live_Data</Badge>
                    </div>
                    <div className="p-4 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black text-zinc-600 uppercase tracking-widest border-b border-zinc-900">
                                    <th className="px-4 py-4">Vehicle_ID</th>
                                    <th className="px-4 py-4">Total_Distance</th>
                                    <th className="px-4 py-4">Active_Hours</th>
                                    <th className="px-4 py-4">Utilization</th>
                                    <th className="px-4 py-4 text-right">Yield</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900">
                                {stats.map((s, i) => (
                                    <tr key={i} className="hover:bg-zinc-900/50 transition-colors group">
                                        <td className="px-4 py-4 text-xs font-black text-white">{s.vehicle_id}</td>
                                        <td className="px-4 py-4 text-xs font-mono text-zinc-400">{Number(s.total_km).toLocaleString()} KM</td>
                                        <td className="px-4 py-4 text-xs font-mono text-zinc-400">{Number(s.total_hours).toFixed(1)} H</td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-16 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500" style={{ width: `${s.utilization_rate}%` }}></div>
                                                </div>
                                                <span className="text-[10px] font-mono font-bold text-zinc-500">{s.utilization_rate.toFixed(1)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right text-xs font-mono font-bold text-emerald-400">
                                            ${s.total_revenue.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-3xl">
                        <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Intelligence_Brief</h4>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <TrendingUp size={14} className="text-emerald-500 mt-1" />
                                <p className="text-[11px] text-zinc-400 leading-relaxed"><span className="text-white font-bold">Priority Beta Found:</span> Vehicle V1 shows 12% higher yield than average. Maintenance optimization recommended.</p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <TrendingDown size={14} className="text-red-500 mt-1" />
                                <p className="text-[11px] text-zinc-400 leading-relaxed"><span className="text-white font-bold">High Waste Detected:</span> Night shift utilization is sub-30%. Consider dynamic rescheduling.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <DollarSign size={80} className="text-white" />
                        </div>
                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Projected_Profitability</h4>
                        <p className="text-2xl font-black text-white tracking-tighter mb-4">$42.8K</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed">Estimated net increase if utilization is optimized to 85% fleet-wide.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
