'use client';

import React from 'react';
import { Battery, Signal, Zap, Clock, Shield, MapPin, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface TrackingSidebarProps {
    selectedVehicle: any | null;
    allVehicles: any[];
}

export const TrackingSidebar: React.FC<TrackingSidebarProps> = ({ selectedVehicle, allVehicles }) => {
    return (
        <div className="w-80 h-full bg-zinc-950 border-l border-zinc-900 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-zinc-900">
                <h2 className="text-xl font-black text-white tracking-tighter uppercase mb-1">Fleet Intelligence</h2>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Always-On Tracking Stream</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedVehicle ? (
                    <div className="space-y-6">
                        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Shield size={64} className="text-indigo-500" />
                            </div>
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Focus Mode: {selectedVehicle.vehicle_id}</p>

                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-zinc-400">Driver</span>
                                    <span className="text-xs font-black text-white">Ahmad Saputra</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-zinc-400">Current Velocity</span>
                                    <div className="flex items-baseline space-x-1">
                                        <span className="text-xl font-mono font-bold text-white">{selectedVehicle.speed || 0}</span>
                                        <span className="text-[10px] font-bold text-zinc-600 uppercase">KM/H</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-zinc-400">Status</span>
                                    <Badge variant={selectedVehicle.status === 'MOVING' ? 'success' : 'warning'}>{selectedVehicle.status}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-xl">
                                <Signal size={14} className="text-emerald-500 mb-2" />
                                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Signal</p>
                                <p className="text-xs font-black text-white">STRONG</p>
                            </div>
                            <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-xl">
                                <Battery size={14} className="text-emerald-500 mb-2" />
                                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Battery</p>
                                <p className="text-xs font-black text-white">82%</p>
                            </div>
                        </div>

                        <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                            <div className="flex items-center space-x-3 mb-4">
                                <Clock size={14} className="text-indigo-400" />
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Last Movement</span>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                                Vehicle detected moving South on <span className="text-white">JI. Thamrin</span>. Headed towards Logistics Hub A.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-zinc-900 rounded-3xl">
                        <Loader2 className="animate-spin text-zinc-700 mb-4" size={32} />
                        <p className="text-xs font-black text-zinc-600 uppercase tracking-widest">Select vehicle to intercept stream</p>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-zinc-900 bg-zinc-950/80">
                <div className="flex items-center justify-between text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3">
                    <span>Live Assets</span>
                    <span>{allVehicles.length} Active</span>
                </div>
                <div className="space-y-2">
                    {allVehicles.slice(0, 3).map((v, i) => (
                        <div key={i} className="flex items-center justify-between p-2 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer group">
                            <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${v.status === 'MOVING' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">{v.vehicle_id}</span>
                            </div>
                            <Zap size={12} className="text-zinc-700" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
