
'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Package, MapPin, Clock, CheckCircle2, AlertCircle, ChevronRight, Truck } from 'lucide-react';

interface Task {
    id: string;
    status: string;
    origin_address: string;
    destination_address: string;
    scheduled_at: string;
}

export default function DriverTasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mocking API call for now
        setTimeout(() => {
            setTasks([
                { id: 'ORD-9921', status: 'IN_PROGRESS', origin_address: 'Warehouse A, Jakarta', destination_address: 'Retailer X, Bandung', scheduled_at: '2026-02-16 14:00' },
                { id: 'ORD-9925', status: 'ASSIGNED', origin_address: 'Port Hub Center', destination_address: 'Warehouse C, Bekasi', scheduled_at: '2026-02-16 16:30' },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'IN_PROGRESS': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
            case 'ASSIGNED': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
        }
    };

    return (
        <DashboardLayout>
            <div className="w-full space-y-8">
                <div className="w-full">
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase mb-2">
                        Driver_<span className="text-indigo-500">Manifesto</span>
                    </h1>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest opacity-60">Active task queue and delivery operational control.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tasks.map((task) => (
                            <div key={task.id} className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-indigo-500/30 dark:hover:border-zinc-700 transition-all hover:shadow-xl dark:hover:shadow-none group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                                            <Truck size={18} className="text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">{task.id}</p>
                                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{task.scheduled_at}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${getStatusColor(task.status)}`}>
                                        {task.status}
                                    </span>
                                </div>

                                <div className="space-y-4 relative border-l-2 border-dashed border-zinc-200 dark:border-zinc-800 ml-4 pl-6">
                                    <div className="relative">
                                        <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-950"></div>
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Pick_Up</p>
                                        <p className="text-xs text-zinc-700 dark:text-white font-medium">{task.origin_address}</p>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white dark:border-zinc-950 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Drop_Off</p>
                                        <p className="text-xs text-zinc-700 dark:text-white font-medium">{task.destination_address}</p>
                                    </div>
                                </div>

                                <button className="w-full mt-6 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex items-center justify-center group/btn">
                                    Continue_Protocol <ChevronRight size={14} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
