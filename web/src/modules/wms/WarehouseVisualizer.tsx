'use client';
import React from 'react';
import { MOCK_ZONES } from './wms.data';
import { Info, Maximize2 } from 'lucide-react';

export const WarehouseVisualizer: React.FC = () => {
    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-2xl">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Warehouse Layout Map</h3>
                        <p className="text-xs text-zinc-500 font-medium">Visual occupancy and zone management</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all">
                            <Maximize2 size={16} />
                        </button>
                        <button className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all">
                            <Info size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 aspect-[2/1]">
                    {MOCK_ZONES.map((zone) => {
                        const occupancyPercent = (zone.occupancy / zone.capacity) * 100;
                        const statusColor = occupancyPercent > 90 ? 'bg-rose-500' : occupancyPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500';
                        const textColor = occupancyPercent > 90 ? 'text-rose-500' : occupancyPercent > 70 ? 'text-amber-500' : 'text-emerald-500';

                        return (
                            <div key={zone.id} className="relative group perspective-1000">
                                <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                <div className="h-full bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-600/50 transition-all hover:-translate-y-1 shadow-sm">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">{zone.type}</span>
                                            <div className={`w-2 h-2 rounded-full ${statusColor} animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.1)] dark:shadow-none`} />
                                        </div>
                                        <h4 className="text-lg font-black text-zinc-800 dark:text-zinc-200 tracking-tighter mb-1">{zone.name}</h4>
                                        <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                                            {zone.occupancy} / {zone.capacity} UNITs
                                        </p>
                                    </div>

                                    <div className="mt-8 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-xl font-black ${textColor}`}>{occupancyPercent.toFixed(0)}%</span>
                                            <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-700 uppercase tracking-widest">Occupancy</span>
                                        </div>
                                        <div className="h-1.5 bg-zinc-100 dark:bg-zinc-950 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800/50 shadow-inner">
                                            <div
                                                className={`h-full ${statusColor} shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-all duration-1000`}
                                                style={{ width: `${occupancyPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12 flex items-center justify-center space-x-12 p-6 bg-zinc-50 dark:bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-1 bg-emerald-500 rounded-full" />
                        <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Optimal (&lt; 70%)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-1 bg-amber-500 rounded-full" />
                        <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">High (70-90%)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-1 bg-rose-500 rounded-full" />
                        <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Critical (&gt; 90%)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
