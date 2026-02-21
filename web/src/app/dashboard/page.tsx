'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPI } from '@/components/ui/KPI';
import { Badge } from '@/components/ui/Badge';
import {
    Package,
    Truck,
    TrendingUp,
    AlertCircle,
    Activity,
    Clock,
    ArrowUpRight,
    MapPin,
    DollarSign,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';
import { OrderList } from '@/modules/orders/OrderList';
import { FleetUtilizationRankings } from '@/modules/analytics/FleetUtilizationRankings';
import { SLAPerformanceCard } from '@/modules/analytics/SLAPerformanceCard';
import { SmartInsightPanel } from '@/modules/analytics/SmartInsightPanel';
import { MOCK_WAREHOUSE_STATS } from '@/modules/wms/wms.data';

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase transition-colors">
                        Executive_<span className="text-indigo-600 dark:text-indigo-500">Command</span>
                    </h1>
                    <div className="h-1 w-12 bg-indigo-600 dark:bg-indigo-500 mt-2"></div>
                    <p className="text-zinc-400 dark:text-zinc-500 mt-3 text-xs font-bold uppercase tracking-widest opacity-80 transition-colors">Global logistics overview and operational intelligence.</p>
                </div>
                <div className="flex items-center space-x-2 px-6 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl shadow-sm transition-all text-zinc-600 dark:text-zinc-300">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live System Sync</span>
                </div>
            </div>

            {/* Top Level KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
                <KPI
                    title="Active Shipments"
                    value="1,284"
                    icon={Package}
                    trend={{ value: 12.5, isUp: true }}
                    description="vs last 24h"
                />
                <KPI
                    title="Global Delivery %"
                    value="98.2%"
                    icon={CheckCircle}
                    trend={{ value: 0.4, isUp: true }}
                    description="Average success rate"
                />
                <KPI
                    title="WH Occupancy"
                    value={`${MOCK_WAREHOUSE_STATS.occupancyRate}%`}
                    icon={Activity}
                    trend={{ value: 1.2, isUp: true }}
                    description="vs yesterday"
                />
                <KPI
                    title="Low Stock SKUs"
                    value={String(MOCK_WAREHOUSE_STATS.lowStockCount)}
                    icon={AlertTriangle}
                    trend={{ value: 2, isUp: false }}
                    description="Requires attention"
                />
                <KPI
                    title="Total Revenue"
                    value="Rp 4.2B"
                    icon={DollarSign}
                    trend={{ value: 8.2, isUp: true }}
                    description="Monthly Projected"
                />
                <KPI
                    title="Active Alerts"
                    value="3"
                    icon={AlertCircle}
                    description="Critical Action Items"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Executive Intelligence Feed */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FleetUtilizationRankings />
                        <SLAPerformanceCard />
                    </div>

                    <SmartInsightPanel />

                    <section className="bg-white dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center space-x-3">
                                <Activity size={18} className="text-indigo-600 dark:text-indigo-400" />
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white">
                                    Strategic_Distribution_Flow
                                </h3>
                            </div>
                        </div>

                        {/* Tactical feed */}
                        <div className="space-y-4">
                            {[
                                { id: 'FL-991', origin: 'Jakarta Central', dest: 'Surabaya Port', status: 'In Transit', progress: 75 },
                                { id: 'WH-402', origin: 'Tangerang Hub', dest: 'Medan WH', status: 'Loading', progress: 20 },
                                { id: 'FL-998', origin: 'Balikpapan Hub', dest: 'Samarinda Port', status: 'Delivered', progress: 100 },
                            ].map((flow, idx) => (
                                <div key={idx} className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 p-5 rounded-2xl hover:border-indigo-500/30 transition-all group">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <p className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tighter transition-colors">{flow.origin} → {flow.dest}</p>
                                            <Badge variant={flow.status === 'In Transit' ? 'warning' : flow.status === 'Delivered' ? 'success' : 'default'}>
                                                {flow.status}
                                            </Badge>
                                        </div>
                                        <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-mono tracking-widest">{flow.id}</span>
                                    </div>
                                    <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-900 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${flow.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Regional Alerts & Growth */}
                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-white dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.3em] mb-6 flex items-center">
                            <AlertCircle size={16} className="mr-3 text-rose-600 dark:text-rose-500" /> Immediate_Action_Required
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                                <p className="text-[10px] font-black text-rose-600 dark:text-rose-500 uppercase mb-1">WH Occupancy Alert</p>
                                <p className="text-sm font-bold text-zinc-900 dark:text-white transition-colors">Tangerang WH reaching 94% capacity. Optimization required.</p>
                            </div>
                            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                                <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase mb-1">Fuel Price Alert</p>
                                <p className="text-sm font-bold text-zinc-900 dark:text-white transition-colors">Fuel costs in Banten increased by +4.2% today.</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-indigo-600 rounded-3xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-4 relative z-10">Expansion_Intel</h3>
                        <p className="text-indigo-100/70 text-sm mb-6 relative z-10">New Logistics Hub opening in Semarang (Q3 2026).</p>
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center space-x-2">
                                <span className="text-4xl font-black text-white tracking-tighter">15</span>
                                <span className="text-xs font-bold text-indigo-200">New Nodes</span>
                            </div>
                            <div className="p-2 bg-white/20 rounded-xl">
                                <ArrowUpRight className="text-white" size={20} />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}
