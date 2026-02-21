'use client';
import React from 'react';
import { Clock, Flame, DollarSign, AlertTriangle } from 'lucide-react';
import { FLEET_UNITS, IDLE_COST_PER_HOUR } from './intelligence.data';

function fmtRp(n: number) {
    if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}K`;
    return `Rp ${n}`;
}

export const IdleCostAnalyzer: React.FC = () => {
    const top5 = [...FLEET_UNITS]
        .sort((a, b) => b.idleHours - a.idleHours)
        .slice(0, 5);

    const totalIdleHours = FLEET_UNITS.reduce((sum, u) => sum + u.idleHours, 0);
    const totalIdleCost = totalIdleHours * IDLE_COST_PER_HOUR;
    const mostIdleUnit = top5[0];

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center space-x-2">
                    <Flame size={16} className="text-amber-500 dark:text-amber-400" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white">Idle_Cost_Analyzer</h3>
                </div>
                <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-600 font-bold border border-zinc-100 dark:border-zinc-800 px-2 py-0.5 rounded-full shadow-inner">Today</span>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-px bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-800">
                {[
                    { icon: Clock, label: 'Total Idle Hours', value: `${totalIdleHours.toFixed(1)}h`, accent: 'text-amber-600 dark:text-amber-400' },
                    { icon: DollarSign, label: 'Idle Cost Today', value: fmtRp(totalIdleCost), accent: 'text-rose-600 dark:text-rose-400' },
                    { icon: AlertTriangle, label: 'At Risk Units', value: String(FLEET_UNITS.filter(u => u.idleHours > 5).length), accent: 'text-rose-600 dark:text-rose-400' },
                ].map(({ icon: Icon, label, value, accent }) => (
                    <div key={label} className="bg-white dark:bg-zinc-950 px-4 py-4 text-center">
                        <Icon size={14} className={`${accent} mx-auto mb-1`} />
                        <p className="text-[8px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">{label}</p>
                        <p className={`text-sm font-black mt-0.5 ${accent}`}>{value}</p>
                    </div>
                ))}
            </div>

            {/* Top 5 idlest trucks */}
            <div className="p-5">
                <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-3">Top 5 Idle Trucks</p>
                <div className="space-y-2.5">
                    {top5.map((unit, i) => {
                        const cost = unit.idleHours * IDLE_COST_PER_HOUR;
                        const pct = (unit.idleHours / mostIdleUnit.idleHours) * 100;
                        return (
                            <div key={unit.id}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-[9px] font-black w-4 ${i === 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-400 dark:text-zinc-600'}`}>#{i + 1}</span>
                                        <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono">{unit.plate}</span>
                                        <span className="text-[9px] text-zinc-400 dark:text-zinc-600">{unit.driver}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-black text-amber-600 dark:text-amber-400">{unit.idleHours.toFixed(1)}h</span>
                                        <span className="text-[9px] text-zinc-400 dark:text-zinc-600 ml-2">{fmtRp(cost)}</span>
                                    </div>
                                </div>
                                <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${pct}%`,
                                            backgroundColor: i === 0 ? '#ef4444' : i === 1 ? '#f97316' : '#f59e0b',
                                            transition: 'width 0.7s ease',
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Insight */}
                <div className="mt-4 p-3 bg-amber-500/5 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/15 rounded-xl shadow-sm">
                    <p className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">💡 Quick Win</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                        Reducing <span className="font-bold text-zinc-900 dark:text-white">{top5[0].plate}</span>'s idle time by 2h saves <span className="font-bold text-amber-600 dark:text-amber-400">{fmtRp(2 * IDLE_COST_PER_HOUR)}</span>/day = <span className="font-bold text-amber-600 dark:text-amber-400">{fmtRp(2 * IDLE_COST_PER_HOUR * 22)}</span>/month
                    </p>
                </div>
            </div>
        </div>
    );
};
