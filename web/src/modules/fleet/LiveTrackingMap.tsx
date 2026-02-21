'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

// Fix for default marker icons in Leaflet + Next.js
const createIcon = (color: string) => L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
});

const STATUS_COLORS = {
    MOVING: '#22c55e', // green-500
    IDLE: '#f59e0b',   // amber-500
    OFFLINE: '#71717a', // zinc-500
    OVERSPEED: '#ef4444', // red-500
};

export const LiveTrackingMap: React.FC<{
    onVehicleSelect: (v: any) => void;
    onVehiclesUpdate?: (vehicles: any[]) => void;
    selectedVehicleId?: string;
}> = ({ onVehicleSelect, onVehiclesUpdate, selectedVehicleId }) => {
    const { user } = useAuthStore();
    const [vehicles, setVehicles] = useState<Record<string, any>>({});
    const [trails, setTrails] = useState<Record<string, [number, number][]>>({});
    const socketRef = useRef<Socket | null>(null);

    // Use a ref for the callback to avoid it being a dependency (would cause infinite loop
    // since parent passes inline arrows that create new references every render)
    const onVehiclesUpdateRef = useRef(onVehiclesUpdate);
    useEffect(() => {
        onVehiclesUpdateRef.current = onVehiclesUpdate;
    });

    useEffect(() => {
        if (onVehiclesUpdateRef.current) {
            onVehiclesUpdateRef.current(Object.values(vehicles));
        }
    }, [vehicles]); // Only re-run when vehicles actually change


    useEffect(() => {
        if (!user) return;

        const token = `mock-jwt|${user.id}|${user.tenantId}|${user.email}`;
        socketRef.current = io('http://localhost:3000/tracking', {
            extraHeaders: { Authorization: `Bearer ${token}` }
        });

        socketRef.current.on('tracking:update', (data) => {
            console.log('🛰️ TRACKING_RECEIVE:', data.vehicle_id, data.status);

            setVehicles(prev => ({
                ...prev,
                [data.vehicle_id]: {
                    ...data,
                    last_update: Date.now()
                }
            }));

            setTrails(prev => {
                const currentTrail = prev[data.vehicle_id] || [];
                const newTrail = [...currentTrail, [data.latitude, data.longitude] as [number, number]];
                // Keep last 360 points (approx 30 mins at 5s interval)
                return {
                    ...prev,
                    [data.vehicle_id]: newTrail.slice(-360)
                };
            });
        });

        // Mock Data Generator for visualization
        const mockVehicles = [
            { id: 'V-ALPHA-1', driver: 'Budi Santoso', lat: -6.2088, lng: 106.8456, status: 'MOVING' as const },
            { id: 'V-BETA-2', driver: 'Agus Salim', lat: -6.1751, lng: 106.8272, status: 'IDLE' as const },
            { id: 'V-GAMMA-3', driver: 'Siti Aminah', lat: -6.2146, lng: 106.8451, status: 'MOVING' as const },
            { id: 'V-DELTA-4', driver: 'Rian Hidayat', lat: -6.1944, lng: 106.8166, status: 'OVERSPEED' as const }
        ];

        const mockInterval = setInterval(() => {
            setVehicles(prev => {
                // If we already have real vehicles from socket, stop mock? 
                // Or merge them for now to ensure user sees "something"
                const next = { ...prev };
                mockVehicles.forEach(mv => {
                    const current = next[mv.id] || {
                        vehicle_id: mv.id,
                        driver_id: mv.driver,
                        latitude: mv.lat,
                        longitude: mv.lng,
                        status: mv.status,
                        speed: 0
                    };

                    // Move randomly
                    const newLat = current.latitude + (Math.random() - 0.5) * 0.001;
                    const newLng = current.longitude + (Math.random() - 0.5) * 0.001;
                    const newSpeed = current.status === 'MOVING' ? 40 + Math.random() * 20 : 0;

                    next[mv.id] = {
                        ...current,
                        latitude: newLat,
                        longitude: newLng,
                        speed: Math.floor(newSpeed),
                        last_update: Date.now()
                    };

                    // Update trails
                    setTrails(prevTrails => {
                        const currentTrail = prevTrails[mv.id] || [];
                        return {
                            ...prevTrails,
                            [mv.id]: [...currentTrail, [newLat, newLng] as [number, number]].slice(-100)
                        };
                    });
                });
                return next;
            });
        }, 3000);

        // Offline detection interval
        const interval = setInterval(() => {
            setVehicles(prev => {
                const next = { ...prev };
                let changed = false;
                Object.keys(next).forEach(id => {
                    // Don't offline mock vehicles too aggressively
                    if (next[id].last_update && Date.now() - next[id].last_update > 45000 && next[id].status !== 'OFFLINE') {
                        next[id] = { ...next[id], status: 'OFFLINE' };
                        changed = true;
                    }
                });
                return changed ? next : prev;
            });
        }, 10000);

        return () => {
            socketRef.current?.disconnect();
            clearInterval(interval);
            clearInterval(mockInterval);
        };
    }, [user]);

    return (
        <MapContainer
            center={[-6.200000, 106.816666]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            {/* Active Vehicle Markers */}
            {Object.values(vehicles).map((v) => (
                <React.Fragment key={v.vehicle_id}>
                    <Marker
                        position={[v.latitude, v.longitude]}
                        icon={createIcon(STATUS_COLORS[v.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.OFFLINE)}
                        eventHandlers={{
                            click: () => onVehicleSelect(v),
                        }}
                    >
                        <Popup>
                            <div className="text-xs">
                                <p className="font-bold">Vehicle: {v.vehicle_id}</p>
                                <p>Status: {v.status}</p>
                                <p>Speed: {v.speed} km/h</p>
                            </div>
                        </Popup>
                    </Marker>

                    {/* Route Trail for focused vehicle */}
                    {selectedVehicleId === v.vehicle_id && trails[v.vehicle_id] && (
                        <Polyline
                            positions={trails[v.vehicle_id]}
                            color="#6366f1"
                            weight={3}
                            opacity={0.6}
                            dashArray="5, 10"
                        />
                    )}
                </React.Fragment>
            ))}
        </MapContainer>
    );
};
