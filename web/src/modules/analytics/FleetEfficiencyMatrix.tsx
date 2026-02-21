'use client';
import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Filter, AlertTriangle } from 'lucide-react';
import { FLEET_UNITS, FleetUnit } from './intelligence.data';

type SortKey = keyof FleetUnit;
type SortDir = 'asc' | 'desc';

function fmtRp(n: number) {
    if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}B`;
    return `Rp ${(n / 1_000_000).toFixed(1)}M`;
}

const REGIONS = ['ALL', 'JAKARTA', 'JAWA_BARAT', 'JAWA_TENGAH', 'JAWA_TIMUR', 'SUMATERA'] as const;

function RiskBadge({ score }: { score: number }) {
    const cfg = score >= 70 ? { bg: 'bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/30', label: 'HIGH' }
        : score >= 40 ? { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', label: 'MED' }
            : { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', label: 'LOW' };
    return (
        <div className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase ${cfg.bg}`}>
            {score >= 70 && <AlertTriangle size={10} />}
            <span>{score}</span>
            <span className="opacity-50">{cfg.label}</span>
        </div>
    );
}

function SortIcon({ col, active, dir }: { col: string; active: boolean; dir: SortDir }) {
    if (!active) return <ArrowUpDown size={12} className="text-zinc-300 dark:text-zinc-700" />;
    return dir === 'asc' ? <ArrowUp size={12} className="text-indigo-600 dark:text-indigo-400" /> : <ArrowDown size={12} className="text-indigo-600 dark:text-indigo-400" />;
}

export const FleetEfficiencyMatrix: React.FC = () => {
    const [sortKey, setSortKey] = useState<SortKey>('utilization');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [region, setRegion] = useState<typeof REGIONS[number]>('ALL');
    const [showBottom, setShowBottom] = useState(false);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
    };

    const sorted = useMemo(() => {
        let data = region === 'ALL' ? [...FLEET_UNITS] : FLEET_UNITS.filter(u => u.region === region);
        data.sort((a, b) => {
            const av = a[sortKey] as number;
            const bv = b[sortKey] as number;
            return sortDir === 'asc' ? av - bv : bv - av;
        });
        return data;
    }, [sortKey, sortDir, region]);

    // Bottom 10% by margin
    const marginsSorted = [...FLEET_UNITS].sort((a, b) => a.margin - b.margin);
    const bottom10Ids = new Set(marginsSorted.slice(0, Math.ceil(FLEET_UNITS.length * 0.1)).map(u => u.id));
    const bottom2Ids = new Set(marginsSorted.slice(0, 2).map(u => u.id));

    const cols: { key: SortKey; label: string; render: (u: FleetUnit) => React.ReactNode }[] = [
        {
            key: 'plate', label: 'Truck', render: u => (
                <div>
                    <p className="text-xs font-black text-zinc-900 dark:text-white font-mono">{u.plate}</p>
                    <p className="text-[9px] text-zinc-400 dark:text-zinc-600">{u.driver}</p>
                </div>
            )
        },
        {
            key: 'utilization', label: 'Utilization', render: u => (
                <div className="flex items-center space-x-2">
                    <div className="w-16 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${u.utilization}%` }} />
                    </div>
                    <span className="text-xs font-black text-zinc-900 dark:text-white">{u.utilization}%</span>
                </div>
            )
        },
        { key: 'revenue', label: 'Revenue', render: u => <span className="text-xs font-bold text-zinc-900 dark:text-white">{fmtRp(u.revenue)}</span> },
        { key: 'cost', label: 'Cost', render: u => <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{fmtRp(u.cost)}</span> },
        {
            key: 'margin', label: 'Margin', render: u => (
                <span className={`text-xs font-black ${u.margin < 0 ? 'text-rose-600 dark:text-rose-400' : u.margin < 15 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {u.margin.toFixed(1)}%
                </span>
            )
        },
        {
            key: 'idleHours', label: 'Idle %', render: u => (
                <span className={`text-xs font-bold ${u.idleHours > 6 ? 'text-rose-600 dark:text-rose-400' : u.idleHours > 3 ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400 dark:text-zinc-600'}`}>
                    {u.idleHours.toFixed(1)}h
                </span>
            )
        },
        { key: 'riskScore', label: 'Risk', render: u => <RiskBadge score={u.riskScore} /> },
    ];

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center space-x-2 flex-1">
                    <Filter size={14} className="text-zinc-400 dark:text-zinc-500" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white">Fleet_Efficiency_Matrix</h3>
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-600 font-bold">{sorted.length} units</span>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowBottom(s => !s)}
                        className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border transition-all ${showBottom ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 shadow-sm' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-400 shadow-sm'}`}
                    >
                        ↓ Bottom 10%
                    </button>
                    <div className="flex bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-0.5 space-x-0.5 overflow-x-auto shadow-inner">
                        {REGIONS.map(r => (
                            <button key={r} onClick={() => setRegion(r)}
                                className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg whitespace-nowrap transition-all ${region === r ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-400'}`}>
                                {r === 'ALL' ? 'All' : r.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
                            {cols.map(col => (
                                <th key={col.key as string} className="text-left px-4 py-3">
                                    <button
                                        onClick={() => handleSort(col.key)}
                                        className="flex items-center space-x-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors"
                                    >
                                        <span>{col.label}</span>
                                        <SortIcon col={col.key as string} active={sortKey === col.key} dir={sortDir} />
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                        {sorted.map(unit => {
                            const isBottom = showBottom && bottom2Ids.has(unit.id);
                            return (
                                <tr key={unit.id}
                                    className={`transition-all hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 ${isBottom ? 'bg-rose-500/5 dark:bg-rose-950/20 border-l-2 border-rose-600/40 dark:border-rose-500/40' : ''}`}>
                                    {cols.map(col => (
                                        <td key={col.key as string} className="px-4 py-3">
                                            {col.render(unit)}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
