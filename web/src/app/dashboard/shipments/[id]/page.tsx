'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Truck, MapPin, Calendar, Clock, DollarSign, Activity } from 'lucide-react';

export default function ShipmentDetailPage() {
    const params = useParams();
    const id = params.id as string;

    return (
        <DashboardLayout>
            <Breadcrumbs items={[
                { label: 'Shipments', href: '/dashboard/shipments' },
                { label: `Shipment #${id.slice(0, 8)}` }
            ]} />

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl">
                        <Truck className="text-indigo-400" size={24} />
                    </div>
                    <div>
                        <div className="flex items-center space-x-3">
                            <h1 className="text-3xl font-bold text-white tracking-tight">TRK-982341</h1>
                            <Badge variant="warning">In Transit</Badge>
                        </div>
                        <p className="text-zinc-500 mt-1">Created on Feb 15, 2026 • Global Corp A</p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <Button variant="secondary">Download Documents</Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 border-none">Update Status</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Timeline & Routing */}
                <div className="lg:col-span-8 space-y-8">
                    <section className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                            <MapPin className="mr-2 text-zinc-500" size={20} /> Route Timeline
                        </h3>
                        {/* Timeline Implementation here */}
                        <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                            {[
                                { title: 'Pickup: Jakarta Port', status: 'Completed', time: '10:00 AM', date: 'Feb 15' },
                                { title: 'Transit: Warehouse A', status: 'Current', time: '02:30 PM', date: 'Feb 15' },
                                { title: 'Dropoff: Surabaya Port', status: 'Pending', time: 'Est. 09:00 AM', date: 'Feb 16' },
                            ].map((step, idx) => (
                                <div key={idx} className="relative pl-12">
                                    <div className={`absolute left-2.5 -translate-x-1/2 w-4 h-4 rounded-full border-2 ${step.status === 'Completed' ? 'bg-emerald-500 border-emerald-500/50' :
                                            step.status === 'Current' ? 'bg-indigo-500 border-indigo-500 animate-pulse' :
                                                'bg-zinc-900 border-zinc-800'
                                        }`}></div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className={`font-bold ${step.status === 'Pending' ? 'text-zinc-500' : 'text-zinc-200'}`}>{step.title}</p>
                                            <p className="text-xs text-zinc-500 mt-1">{step.status}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-zinc-300 font-mono uppercase">{step.time}</p>
                                            <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">{step.date}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                            <Activity className="mr-2 text-zinc-500" size={20} /> Activity Log
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs py-2 border-b border-zinc-800/50">
                                <span className="text-zinc-400">Driver assigned: Mike Ross</span>
                                <span className="text-zinc-600 font-mono">Feb 15, 09:12 AM</span>
                            </div>
                            <div className="flex items-center justify-between text-xs py-2 border-b border-zinc-800/50">
                                <span className="text-zinc-400">Shipment created by Admin</span>
                                <span className="text-zinc-600 font-mono">Feb 15, 08:30 AM</span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Financials & Specs */}
                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                            <DollarSign className="mr-2 text-zinc-500" size={20} /> Financial Breakdown
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Base Revenue</span>
                                <span className="text-white font-mono font-bold">$1,250.00</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Operating Cost</span>
                                <span className="text-red-500 font-mono font-bold">-$850.00</span>
                            </div>
                            <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
                                <span className="text-sm font-bold text-emerald-500">Net Profit</span>
                                <span className="text-xl font-black text-emerald-500 font-mono">$400.00</span>
                            </div>
                        </div>
                    </section>

                    <section className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Specifications</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                                <p className="text-[10px] text-zinc-600 uppercase font-bold">Weight</p>
                                <p className="text-sm font-bold text-zinc-300 mt-1">450 KG</p>
                            </div>
                            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                                <p className="text-[10px] text-zinc-600 uppercase font-bold">Volume</p>
                                <p className="text-sm font-bold text-zinc-300 mt-1">2.4 CBM</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}
