'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Activity, Gauge, Thermometer, Fuel, Wifi, WifiOff, Zap } from 'lucide-react';

interface TelemetryData {
    vehicleId: string;
    speed: number;          // km/h
    fuel: number;           // %
    engineTemp: number;     // °C
    rpm: number;
    lat: number;
    lng: number;
    status: 'MOVING' | 'IDLE' | 'OFFLINE';
    timestamp: number;
}

// Simulated telemetry stream — no WebSocket needed for the panel itself
function useTelemetrySimulation(vehicleId: string) {
    const [data, setData] = useState<TelemetryData>({
        vehicleId,
        speed: 72,
        fuel: 68,
        engineTemp: 88,
        rpm: 2400,
        lat: -6.2,
        lng: 106.8,
        status: 'MOVING',
        timestamp: Date.now(),
    });

    const frameRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        frameRef.current = setInterval(() => {
            setData(prev => {
                const speedDelta = (Math.random() - 0.48) * 6;
                const newSpeed = Math.max(0, Math.min(120, prev.speed + speedDelta));
                return {
                    ...prev,
                    speed: Math.round(newSpeed),
                    fuel: Math.max(5, prev.fuel - 0.02),
                    engineTemp: Math.max(70, Math.min(105, prev.engineTemp + (Math.random() - 0.5) * 1.5)),
                    rpm: Math.round(1200 + (newSpeed / 120) * 3000 + (Math.random() - 0.5) * 200),
                    status: newSpeed < 2 ? 'IDLE' : 'MOVING',
                    timestamp: Date.now(),
                };
            });
        }, 800);
        return () => { if (frameRef.current) clearInterval(frameRef.current); };
    }, [vehicleId]);

    return data;
}

function GaugeRing({ value, max, color, label, unit }: { value: number; max: number; color: string; label: string; unit: string }) {
    const pct = Math.min(1, value / max);
    const r = 36;
    const circumference = 2 * Math.PI * r;
    const strokeDash = pct * circumference * 0.75; // 270° arc
    const offset = circumference * 0.125; // start at -135°

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
                <svg viewBox="0 0 96 96" className="w-full h-full -rotate-[135deg]">
                    {/* Track */}
                    <circle cx="48" cy="48" r={r} fill="none" stroke="currentColor" strokeWidth="6"
                        className="text-zinc-100 dark:text-zinc-800"
                        strokeDasharray={`${circumference * 0.75} ${circumference}`}
                        strokeDashoffset={-offset} strokeLinecap="round" />
                    {/* Fill */}
                    <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="6"
                        strokeDasharray={`${strokeDash} ${circumference}`}
                        strokeDashoffset={-offset} strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 0.4s ease' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-black text-zinc-900 dark:text-white leading-none">{Math.round(value)}</span>
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-600 font-bold">{unit}</span>
                </div>
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mt-1">{label}</p>
        </div>
    );
}

const VEHICLES = ['B 9012 GHI', 'B 3456 JKL'];

export const TelemetryPanel: React.FC = () => {
    const [selectedVehicle, setSelectedVehicle] = useState(VEHICLES[0]);
    const data = useTelemetrySimulation(selectedVehicle);

    const statusColor = data.status === 'MOVING' ? 'text-emerald-400' : data.status === 'IDLE' ? 'text-amber-400' : 'text-zinc-600';

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center space-x-3">
                    <Activity size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white">Real-Time_Telemetry</h2>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">LIVE</span>
                </div>
            </div>

            {/* Vehicle selector */}
            <div className="flex space-x-2 px-6 pt-4">
                {VEHICLES.map(v => (
                    <button
                        key={v}
                        onClick={() => setSelectedVehicle(v)}
                        className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${selectedVehicle === v
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                            : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400'
                            }`}
                    >
                        {v}
                    </button>
                ))}
            </div>

            {/* Gauges */}
            <div className="flex items-center justify-around px-6 py-6">
                <GaugeRing value={data.speed} max={120} color="#6366f1" label="Speed" unit="km/h" />
                <GaugeRing value={data.rpm} max={6000} color="#10b981" label="RPM" unit="×1000" />
                <GaugeRing value={data.engineTemp} max={120} color={data.engineTemp > 95 ? '#ef4444' : '#f59e0b'} label="Temp" unit="°C" />
                <GaugeRing value={data.fuel} max={100} color={data.fuel < 20 ? '#ef4444' : '#22d3ee'} label="Fuel" unit="%" />
            </div>

            {/* Status bar */}
            <div className="grid grid-cols-3 gap-px bg-zinc-100 dark:bg-zinc-800 border-t border-zinc-100 dark:border-zinc-800">
                <div className="bg-white dark:bg-zinc-950 px-4 py-3 text-center">
                    <p className="text-[9px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-widest">Status</p>
                    <p className={`text-xs font-black uppercase mt-1 flex items-center justify-center space-x-1 ${statusColor}`}>
                        <Zap size={10} />
                        <span>{data.status}</span>
                    </p>
                </div>
                <div className="bg-white dark:bg-zinc-950 px-4 py-3 text-center">
                    <p className="text-[9px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-widest">Last Signal</p>
                    <p className="text-xs font-black text-zinc-900 dark:text-white mt-1 font-mono" suppressHydrationWarning>
                        {new Date(data.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                </div>
                <div className="bg-white dark:bg-zinc-950 px-4 py-3 text-center">
                    <p className="text-[9px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-widest">Signal</p>
                    <div className="flex items-center justify-center mt-1 space-x-1">
                        <Wifi size={12} className="text-emerald-500 dark:text-emerald-400" />
                        <span className="text-xs font-black text-emerald-500 dark:text-emerald-400">STRONG</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
