'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { Truck, Navigation, Activity, Clock, AlertTriangle, ShieldCheck, Map as MapIcon, Zap, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { FleetHeatmap } from './FleetHeatmap';

// Fix Leaflet marker icons
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface VehicleUpdate {
    vehicleId: string;
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    recordedAt: string;
}

interface Geofence {
    id: string;
    name: string;
    type: 'WAREHOUSE' | 'PORT' | 'CUSTOMER' | 'DEPOT';
    geometry: any; // GeoJSON
}

interface Incident {
    id: string;
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    created_at: string;
    vehicle_id: string;
}

export const FleetLiveMap: React.FC = () => {
    const { user } = useAuthStore();
    const [vehicles, setVehicles] = useState<Record<string, VehicleUpdate>>({});
    const [geofences, setGeofences] = useState<Geofence[]>([]);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [heatmapData, setHeatmapData] = useState<any[]>([]);
    const [loadingHeatmap, setLoadingHeatmap] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    const fetchHeatmap = async () => {
        if (!user) return;
        setLoadingHeatmap(true);
        try {
            const res = await api.get('/analytics/ops/heatmap');
            setHeatmapData(res.data);
        } catch (err) {
            console.error('Heatmap fetch failed', err);
        } finally {
            setLoadingHeatmap(false);
        }
    };

    useEffect(() => {
        if (showHeatmap && heatmapData.length === 0) {
            fetchHeatmap();
        }
    }, [showHeatmap, user, heatmapData.length]); // Added user and heatmapData.length to dependencies

    useEffect(() => {
        if (!user) return;

        // Fetch initial layers
        const fetchData = async () => {
            try {
                const [gfRes, incRes] = await Promise.all([
                    api.get('/tracking/geofences'),
                    api.get('/tracking/incidents')
                ]);
                setGeofences(gfRes.data);
                setIncidents(incRes.data);
            } catch (err) {
                console.error('Failed to fetch map layers', err);
            }
        };
        fetchData();

        const token = `mock-jwt|${user.id}|${user.tenantId}|${user.email}`;
        socketRef.current = io('http://localhost:3000/tracking', {
            extraHeaders: { Authorization: `Bearer ${token}` }
        });

        socketRef.current.on('connect', () => {
            console.log('Connected to tracking socket');
        });

        socketRef.current.on('tracking:update', (data: VehicleUpdate) => {
            setVehicles(prev => ({ ...prev, [data.vehicleId]: data }));
        });

        socketRef.current.on('tracking:alert', (alert: any) => {
            if (alert.type === 'INCIDENT') {
                setIncidents(prev => [alert, ...prev].slice(0, 10));
                // Optional: Sound notification
            }
        });

        return () => { socketRef.current?.disconnect(); };
    }, [user]);

    const getStatusColor = (speed: number) => {
        if (speed > 5) return 'success';
        if (speed > 0) return 'warning';
        return 'default';
    };

    const getGeofenceStyle = (type: string) => {
        switch (type) {
            case 'WAREHOUSE': return { color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.2 };
            case 'PORT': return { color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.2 };
            case 'CUSTOMER': return { color: '#10b981', fillColor: '#10b981', fillOpacity: 0.2 };
            default: return { color: '#71717a', fillColor: '#71717a', fillOpacity: 0.1 };
        }
    };

    return (
        <div className="h-[700px] rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 relative shadow-2xl">
            <MapContainer
                center={[-6.2088, 106.8456]}
                zoom={12}
                className="h-full w-full grayscale-[0.8] invert-[0.9] brightness-[0.8] contrast-[1.2]"
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {showHeatmap && <FleetHeatmap data={heatmapData} />}

                {/* Render Geofences */}
                {geofences.map(gf => {
                    const coords = gf.geometry.coordinates[0].map((c: any) => [c[1], c[0]]);
                    return (
                        <Polygon
                            key={gf.id}
                            positions={coords}
                            pathOptions={getGeofenceStyle(gf.type)}
                        >
                            <Tooltip sticky direction="top" className="custom-tooltip">
                                <div className="p-1 font-black uppercase text-[10px] tracking-widest">
                                    <span className="text-zinc-500 mr-2">[{gf.type}]</span>
                                    {gf.name}
                                </div>
                            </Tooltip>
                        </Polygon>
                    );
                })}

                {/* Render Vehicles */}
                {Object.values(vehicles).map((vehicle) => (
                    <Marker
                        key={vehicle.vehicleId}
                        position={[vehicle.latitude, vehicle.longitude]}
                        icon={L.divIcon({
                            className: 'custom-div-icon',
                            html: `
                                <div class="relative">
                                    <div class="absolute -top-4 -left-4 w-8 h-8 ${vehicle.speed > 80 ? 'bg-red-500/30' : 'bg-indigo-500/20'} rounded-full animate-ping"></div>
                                    <div class="relative w-4 h-4 ${vehicle.speed > 80 ? 'bg-red-500' : 'bg-indigo-500'} rounded-full border-2 border-white shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                </div>
                            `,
                            iconSize: [16, 16],
                        })}
                    >
                        <Popup className="custom-popup">
                            <div className="p-2 min-w-[200px] bg-zinc-900 text-white rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-black tracking-tighter">VEHICLE ID: {vehicle.vehicleId.slice(0, 8)}</span>
                                    <Badge variant={getStatusColor(vehicle.speed)}>
                                        {vehicle.speed > 5 ? 'MOVING' : 'IDLE'}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Activity size={14} className="text-zinc-500" />
                                        <span className="text-xs font-bold">{Math.round(vehicle.speed)} km/h</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Navigation size={14} className="text-zinc-500" style={{ transform: `rotate(${vehicle.heading}deg)` }} />
                                        <span className="text-xs font-bold">{Math.round(vehicle.heading)}°</span>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center space-x-2 text-[10px] text-zinc-500 uppercase tracking-widest font-black">
                                    <Clock size={10} />
                                    <span>Updated: {new Date(vehicle.recordedAt).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Tactical Intelligence Overlay */}
            <div className="absolute top-6 left-6 z-[1000] w-80 space-y-4">
                {/* 0. Executive Controls */}
                <div className="bg-zinc-950/90 backdrop-blur-md border border-zinc-800 p-4 rounded-2xl shadow-2xl">
                    <button
                        onClick={() => setShowHeatmap(!showHeatmap)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${showHeatmap
                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            {loadingHeatmap ? (
                                <Loader2 size={16} className="animate-spin text-indigo-500" />
                            ) : (
                                <Zap size={16} className={showHeatmap ? 'text-indigo-400' : 'text-zinc-500'} />
                            )}
                            <span className="text-[10px] font-black uppercase tracking-widest">Heatmap Mode</span>
                        </div>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${showHeatmap ? 'bg-indigo-500' : 'bg-zinc-800'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showHeatmap ? 'left-6' : 'left-1'}`}></div>
                        </div>
                    </button>
                </div>

                {/* 1. Alerts Feed */}
                <div className="bg-zinc-950/90 backdrop-blur-md border border-zinc-800 p-5 rounded-2xl shadow-2xl ring-1 ring-red-500/20">
                    <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-4 flex items-center justify-between">
                        <span className="flex items-center"><AlertTriangle size={14} className="mr-2" /> Live_Incidents</span>
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    </h3>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {incidents.length === 0 ? (
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center py-2">No active threats detected.</p>
                        ) : (
                            incidents.map(inc => (
                                <div key={inc.id} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl group transition-all">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-black text-red-500 uppercase">{inc.type}</span>
                                        <span className="text-[9px] text-zinc-600 font-mono">{new Date(inc.created_at).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-zinc-300 leading-tight">{inc.description}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 2. Operations Hub (Existing) */}
                <div className="bg-zinc-950/90 backdrop-blur-md border border-zinc-800 p-5 rounded-2xl shadow-2xl overflow-hidden relative">
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/10 blur-3xl rounded-full"></div>
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-4 flex items-center">
                        <Activity size={14} className="mr-2 text-indigo-500" /> Operational_Flow
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                        {Object.values(vehicles).length === 0 ? (
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center py-4">Scanning frequencies...</p>
                        ) : (
                            Object.values(vehicles).map(v => (
                                <div key={v.vehicleId} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between group hover:border-indigo-500/50 transition-all cursor-pointer">
                                    <div>
                                        <p className="text-[10px] font-black text-white mb-0.5 uppercase tracking-tighter">UNIT-{v.vehicleId.slice(0, 4).toUpperCase()}</p>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-[9px] text-zinc-500 font-bold tracking-widest">{Math.round(v.speed)} KM/H</span>
                                        </div>
                                    </div>
                                    <div className={`w-1.5 h-1.5 rounded-full ${v.speed > 80 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : v.speed > 5 ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Custom UI for invert/grayscale map */}
            <style jsx global>{`
                .leaflet-container {
                    background: #09090b !important;
                }
                .custom-popup .leaflet-popup-content-wrapper {
                    background: #18181b !important;
                    color: white !important;
                    border: 1px solid #27272a !important;
                    border-radius: 12px !important;
                    padding: 0 !important;
                }
                .custom-popup .leaflet-popup-content {
                    margin: 0 !important;
                }
                .custom-popup .leaflet-popup-tip {
                    background: #18181b !important;
                    border: 1px solid #27272a !important;
                }
            `}</style>
        </div>
    );
};
