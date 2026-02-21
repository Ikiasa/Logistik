'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { TrackingSidebar } from '@/modules/fleet/TrackingSidebar';
import { useAuthStore } from '@/store/authStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PlayCircle, Settings, Map as MapIcon, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Dynamic imports for Leaflet-dependent components
const LiveTrackingMap = dynamic(() => import('@/modules/fleet/LiveTrackingMap').then(mod => mod.LiveTrackingMap), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-zinc-950 flex items-center justify-center text-zinc-500 font-mono text-[10px] tracking-widest">INITIALIZING_LIVE_MAP...</div>
});

const RoutePlayback = dynamic(() => import('@/modules/fleet/RoutePlayback').then(mod => mod.RoutePlayback), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-zinc-950 flex items-center justify-center text-zinc-500 font-mono text-[10px] tracking-widest">LOADING_ARCHIVE_DATA...</div>
});

export default function FleetLivePage() {
    const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
    const [activeVehicles, setActiveVehicles] = useState<any[]>([]);
    const [view, setView] = useState<'live' | 'history'>('live');

    // We could lift the vehicle state here if needed, but for now TrackingSidebar gets its own or subset

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-160px)] flex flex-col">
                <div className="flex items-center justify-between mb-8 overflow-hidden">
                    <div>
                        <Breadcrumbs items={[
                            { label: 'Fleet Operations', href: '/dashboard/fleet' },
                            { label: 'Live Intelligence Hub' }
                        ]} />
                        <div className="mt-4">
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
                                Always-On_<span className="text-indigo-500">Live_Tracking</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <div className="flex p-1 bg-zinc-950 border border-zinc-900 rounded-xl">
                            <button
                                onClick={() => setView('live')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'live' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >Live Map</button>
                            <button
                                onClick={() => setView('history')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'history' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >Route History</button>
                        </div>
                        <Button variant="secondary" onClick={() => { }}>
                            <Settings size={18} className="mr-2" /> Global Config
                        </Button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden bg-zinc-950 border border-zinc-900 rounded-3xl shadow-2xl">
                    <div className="flex-1 relative">
                        {view === 'live' ? (
                            <LiveTrackingMap
                                onVehicleSelect={(v) => setSelectedVehicle(v)}
                                onVehiclesUpdate={(vs) => setActiveVehicles(vs)}
                                selectedVehicleId={selectedVehicle?.vehicle_id}
                            />

                        ) : (
                            <div className="p-8 h-full">
                                {selectedVehicle ? (
                                    <RoutePlayback vehicleId={selectedVehicle.vehicle_id} />
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 font-mono">
                                        SELECT A VEHICLE TO LOAD HISTORY
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Map Overlays */}
                        <div className="absolute top-6 left-6 z-[1000] flex flex-col space-y-3">
                            <div className="px-4 py-2 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-xl flex items-center space-x-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">WSS Sync Active</span>
                            </div>
                        </div>
                    </div>

                    <TrackingSidebar
                        selectedVehicle={selectedVehicle}
                        allVehicles={activeVehicles}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
