'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPIProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isUp: boolean;
    };
    description?: string;
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'default';
}

export const KPI: React.FC<KPIProps> = ({ title, value, icon: Icon, trend, description, variant = 'default' }) => {
    const variantStyles = {
        primary: 'hover:border-indigo-500/30',
        success: 'hover:border-emerald-500/30',
        warning: 'hover:border-amber-500/30',
        error: 'hover:border-red-500/30',
        default: 'hover:border-zinc-500/30',
    };

    const iconStyles = {
        primary: 'text-indigo-400 group-hover:text-indigo-300 bg-indigo-500/10 border-indigo-500/20',
        success: 'text-emerald-400 group-hover:text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
        warning: 'text-amber-400 group-hover:text-amber-300 bg-amber-500/10 border-amber-500/20',
        error: 'text-red-400 group-hover:text-red-300 bg-red-500/10 border-red-500/20',
        default: 'text-zinc-400 group-hover:text-zinc-300 bg-zinc-500/10 border-zinc-500/20',
    };

    return (
        <div className={`w-full bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl transition-all hover:shadow-lg dark:hover:shadow-none group relative overflow-hidden ${variantStyles[variant]}`}>
            {/* Subtle side indicator */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${variant === 'primary' ? 'bg-indigo-500/50' : variant === 'success' ? 'bg-emerald-500/50' : variant === 'warning' ? 'bg-amber-500/50' : variant === 'error' ? 'bg-red-500/50' : 'bg-zinc-200 dark:bg-zinc-800'}`}></div>

            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 border rounded-xl transition-colors shadow-inner ${iconStyles[variant]}`}>
                    <Icon size={20} />
                </div>
                {trend && (
                    <div className={`flex items-center text-[10px] font-black px-2 py-1 rounded-lg border tracking-tighter ${trend.isUp
                        ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20'
                        : 'bg-red-500/5 text-red-500 border-red-500/20'
                        }`}>
                        {trend.isUp ? <TrendingUp size={10} className="mr-1" /> : <TrendingDown size={10} className="mr-1" />}
                        {trend.value}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em]">{title}</p>
                <h2 className="text-3xl font-mono font-bold text-zinc-900 dark:text-white mt-1 break-all tracking-tighter">{value}</h2>
                {description && (
                    <p className="text-[10px] text-zinc-500 mt-2 font-medium uppercase italic opacity-60 tracking-wider">
                        // {description}
                    </p>
                )}
            </div>
        </div>
    );
};
