'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Map as MapIcon, History, PlayCircle, Settings, Shield } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const FleetLiveMap = dynamic(() => import('@/modules/fleet/FleetLiveMap').then(mod => mod.FleetLiveMap), { ssr: false });
const RoutePlayback = dynamic(() => import('@/modules/fleet/RoutePlayback').then(mod => mod.RoutePlayback), { ssr: false });

export default function FleetTrackingPage() {
    const { user } = useAuthStore();
    const [view, setView] = useState<'live' | 'history'>('live');
    const [selectedVehicleId, setSelectedVehicleId] = useState('v-101'); // Mock selection

    const startSimulation = async () => {
        if (!user) return;
        try {
            const token = `mock-jwt|${user.id}|${user.tenantId}|${user.email}`;
            await axios.post('http://localhost:3000/tracking/simulate/start',
                { vehicleId: selectedVehicleId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Simulation signal started for: ' + selectedVehicleId);
        } catch (error) {
            console.error('Failed to start simulation:', error);
        }
    };

    return (
        <DashboardLayout>
            <Breadcrumbs items={[
                { label: 'Fleet Management', href: '/dashboard/fleet' },
                { label: 'Live Intelligence' }
            ]} />

            <div className="flex items-center justify-between mb-8 pb-8 border-b border-zinc-900">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl">
                        <MapIcon className="text-indigo-400" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Geospatial Intelligence</h1>
                        <p className="text-zinc-500 mt-1">Real-time telematics and historical route visualization.</p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <div className="flex p-1 bg-zinc-950 border border-zinc-900 rounded-xl mr-4">
                        <button
                            onClick={() => setView('live')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'live' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            <PlayCircle size={14} className="inline mr-2" /> Live Map
                        </button>
                        <button
                            onClick={() => setView('history')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'history' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            <History size={14} className="inline mr-2" /> Route History
                        </button>
                    </div>
                    <Button variant="secondary" onClick={startSimulation}>
                        <Settings size={18} className="mr-2" /> Initiate Signal
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-12">
                    {view === 'live' ? (
                        <FleetLiveMap />
                    ) : (
                        <RoutePlayback vehicleId={selectedVehicleId} />
                    )}
                </div>
            </div>

            <div className="mt-12 p-6 bg-zinc-950/50 border border-zinc-900 rounded-3xl flex items-center justify-between">
                <div className="flex items-center space-x-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Telemetry Status</span>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-white uppercase">Encrypted Stream Active</span>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-zinc-900"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Signal Protocol</span>
                        <span className="text-xs font-mono font-bold text-zinc-400 italic">WSS Over AES-256</span>
                    </div>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                    <Shield className="text-indigo-500" size={14} />
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Tenant Privacy Shield: Active</span>
                </div>
            </div>
        </DashboardLayout>
    );
}
