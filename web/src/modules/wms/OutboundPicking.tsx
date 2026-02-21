'use client';
import React from 'react';
import { PickingTask } from './types';
import { MOCK_PICKING_TASKS } from './wms.data';
import { PackageSearch, User, Layers, ArrowUpRight, Zap, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const OutboundPicking: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-[0_0_30px_rgba(79,70,229,0.3)] border border-indigo-500/50">
                    <div className="flex items-center justify-between mb-4">
                        <Zap size={24} className="text-white fill-white" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Priority Mode</span>
                    </div>
                    <h3 className="text-2xl font-black mb-1 tracking-tighter">Fast-Track Picking</h3>
                    <p className="text-sm text-indigo-100 font-medium opacity-80">3 urgent orders waiting for allocation.</p>
                    <button className="mt-6 w-full py-2 bg-white text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-colors shadow-lg">
                        Optimize Routes
                    </button>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <Layers size={24} className="text-indigo-600 dark:text-indigo-400" />
                        <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Efficiency</span>
                    </div>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-1 tracking-tighter">92.4%</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Average picking accuracy this shift.</p>
                    <div className="mt-4 flex items-center space-x-2">
                        <span className="text-[10px] font-black text-emerald-500 dark:text-emerald-400 font-mono">+1.2%</span>
                        <div className="flex-1 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full">
                            <div className="h-full bg-indigo-500 w-11/12" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 tracking-tight">Active Picking Queue</h3>
                <div className="space-y-3">
                    {MOCK_PICKING_TASKS.map((task) => (
                        <div key={task.id} className="flex items-center space-x-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-2xl transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700/50 group">
                            <GripVertical size={16} className="text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-500" />
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-1">
                                    <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 font-mono tracking-tighter uppercase">{task.orderId}</span>
                                    <Badge variant={task.priority === 'URGENT' ? 'error' : 'indigo'}>
                                        {task.priority}
                                    </Badge>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <PackageSearch size={14} className="text-zinc-400 dark:text-zinc-500" />
                                        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">{task.itemsCount} SKUs</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Layers size={14} className="text-zinc-400 dark:text-zinc-500" />
                                        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">{task.zone}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center justify-end space-x-2 mb-2">
                                    {task.assignedTo ? (
                                        <>
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{task.assignedTo}</span>
                                            <div className="w-6 h-6 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20 dark:border-indigo-500/30">
                                                <User size={12} className="text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                        </>
                                    ) : (
                                        <button className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest underline underline-offset-4">Assign Staff</button>
                                    )}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${task.status === 'IN_PROGRESS' ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                    {task.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
