'use client';

import React from 'react';

interface TacticalKPIProps {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    color?: 'green' | 'amber' | 'red' | 'gray';
}

export const TacticalKPI: React.FC<TacticalKPIProps> = ({ label, value, trend, color = 'green' }) => {
    const colorMap = {
        green: 'text-tactical-green border-tactical-green/30',
        amber: 'text-tactical-amber border-tactical-amber/30',
        red: 'text-tactical-red border-tactical-red/30',
        gray: 'text-zinc-500 border-zinc-500/30'
    };

    const glowMap = {
        green: 'shadow-[0_0_10px_rgba(0,255,65,0.1)]',
        amber: 'shadow-[0_0_10px_rgba(255,176,0,0.1)]',
        red: 'shadow-[0_0_10px_rgba(255,0,0,0.1)]',
        gray: ''
    };

    return (
        <div className={`px-4 py-2 bg-tactical-panel/40 border-l-2 ${colorMap[color]} ${glowMap[color]} backdrop-blur-sm`}>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 opacity-60">
                {label}
            </div>
            <div className="flex items-baseline space-x-2">
                <span className="text-xl font-mono font-bold tracking-tighter tactical-text-glow">
                    {value}
                </span>
                {trend && (
                    <span className="text-[10px] font-black">
                        {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '■'}
                    </span>
                )}
            </div>
        </div>
    );
};
