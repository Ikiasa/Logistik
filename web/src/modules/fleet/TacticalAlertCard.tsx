'use client';

import React from 'react';
import { AlertTriangle, ShieldAlert, Zap, Radio } from 'lucide-react';

interface TacticalAlertProps {
    type: 'IDLE' | 'GEOFENCE' | 'SPEED' | 'EMERGENCY';
    vehicleId: string;
    message: string;
    timestamp: string;
}

export const TacticalAlertCard: React.FC<TacticalAlertProps> = ({ type, vehicleId, message, timestamp }) => {
    const config = {
        IDLE: {
            icon: Radio,
            color: 'tactical-amber',
            label: 'IDLE WARNING',
            border: 'border-tactical-amber/20'
        },
        GEOFENCE: {
            icon: ShieldAlert,
            color: 'tactical-green',
            label: 'ZONE BREACH',
            border: 'border-tactical-green/20'
        },
        SPEED: {
            icon: Zap,
            color: 'tactical-red',
            label: 'VELOCITY ALERT',
            border: 'border-tactical-red/30 animate-tactical-red'
        },
        EMERGENCY: {
            icon: AlertTriangle,
            color: 'tactical-red',
            label: 'CRITICAL EVENT',
            border: 'border-tactical-red animate-tactical-red shadow-[0_0_20px_rgba(255,0,0,0.2)]'
        }
    }[type];

    const Icon = config.icon;

    return (
        <div className={`p-4 bg-tactical-panel/80 border ${config.border} rounded-sm relative overflow-hidden group`}>
            {/* Tactical scanning line effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-tactical-green/5 to-transparent h-[200%] -translate-y-full group-hover:translate-y-full transition-transform duration-[2s] pointer-events-none"></div>

            <div className="flex items-start space-x-4">
                <div className={`p-2 bg-black border ${config.border}`}>
                    <Icon size={18} className={`text-${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-black tracking-widest text-${config.color}`}>
                            {config.label}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-600">
                            {timestamp}
                        </span>
                    </div>
                    <h4 className="text-white text-xs font-bold truncate mb-1 uppercase tracking-tight">
                        TRK-{vehicleId.slice(0, 8).toUpperCase()}
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-medium leading-relaxed uppercase">
                        {message}
                    </p>
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
                <div className="flex space-x-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`w-1 h-3 border border-zinc-800 ${i === 1 ? `bg-${config.color}/40` : ''}`}></div>
                    ))}
                </div>
                <button className={`text-[9px] font-black tracking-[0.2em] text-${config.color} hover:opacity-100 opacity-60 transition-opacity uppercase underline underline-offset-4`}>
                    ACKNOWLEDGE
                </button>
            </div>
        </div>
    );
};
