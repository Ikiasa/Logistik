'use client';
import React, { useState } from 'react';
import { Clock, User, CheckCircle2, Circle, ChevronRight, Truck } from 'lucide-react';

interface ShiftSlot {
    id: string;
    driver: string;
    vehicle: string;
    route: string;
    start: string;
    end: string;
    status: 'COMPLETED' | 'ACTIVE' | 'UPCOMING' | 'STANDBY';
    progress: number; // 0-100
}

const SHIFTS: ShiftSlot[] = [
    { id: 'S-001', driver: 'Budi Santoso', vehicle: 'B 1234 ABC', route: 'Jakarta → Bandung', start: '05:00', end: '13:00', status: 'COMPLETED', progress: 100 },
    { id: 'S-002', driver: 'Andi Wijaya', vehicle: 'B 5678 DEF', route: 'Bandung → Surabaya', start: '07:00', end: '15:00', status: 'COMPLETED', progress: 100 },
    { id: 'S-003', driver: 'Cahyo Pramono', vehicle: 'B 9012 GHI', route: 'Jakarta → Semarang', start: '09:00', end: '17:00', status: 'ACTIVE', progress: 62 },
    { id: 'S-004', driver: 'Deni Firmansyah', vehicle: 'B 3456 JKL', route: 'Semarang → Yogyakarta', start: '11:00', end: '19:00', status: 'ACTIVE', progress: 28 },
    { id: 'S-005', driver: 'Eko Prasetyo', vehicle: 'B 7890 MNO', route: 'Jakarta → Bogor', start: '13:00', end: '21:00', status: 'UPCOMING', progress: 0 },
    { id: 'S-006', driver: 'Fajar Nugroho', vehicle: 'B 2468 PQR', route: 'Bogor → Depok', start: '15:00', end: '23:00', status: 'UPCOMING', progress: 0 },
    { id: 'S-007', driver: 'Gunawan Hidayat', vehicle: 'B 1357 STU', route: 'Standby', start: '—', end: '—', status: 'STANDBY', progress: 0 },
];

const STATUS_CONFIG = {
    COMPLETED: { color: 'text-zinc-500 dark:text-zinc-600', bar: 'bg-zinc-200 dark:bg-zinc-700', badge: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500', dot: 'bg-zinc-400 dark:bg-zinc-600' },
    ACTIVE: { color: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20', dot: 'bg-emerald-500 dark:bg-emerald-400 animate-pulse' },
    UPCOMING: { color: 'text-indigo-600 dark:text-indigo-400', bar: 'bg-indigo-500/30', badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20', dot: 'bg-indigo-600 dark:bg-indigo-400' },
    STANDBY: { color: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500/30', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20', dot: 'bg-amber-600 dark:bg-amber-400' },
};

export const ShiftTimeline: React.FC = () => {
    const [selected, setSelected] = useState<string | null>('S-003');

    const active = SHIFTS.filter(s => s.status === 'ACTIVE').length;
    const upcoming = SHIFTS.filter(s => s.status === 'UPCOMING').length;

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center space-x-3">
                    <Clock size={16} className="text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white">Shift_Timeline</h2>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">{active} ACTIVE</span>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">{upcoming} UPCOMING</span>
                </div>
            </div>

            {/* Timeline grid */}
            <div className="divide-y divide-zinc-50 dark:divide-zinc-900">
                {SHIFTS.map(shift => {
                    const cfg = STATUS_CONFIG[shift.status];
                    const isSelected = selected === shift.id;
                    return (
                        <div
                            key={shift.id}
                            onClick={() => setSelected(isSelected ? null : shift.id)}
                            className={`px-6 py-3 cursor-pointer transition-all ${isSelected ? 'bg-zinc-50 dark:bg-zinc-900' : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50'}`}
                        >
                            <div className="flex items-center space-x-4">
                                {/* Status dot */}
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />

                                {/* Shift time */}
                                <div className="w-24 flex-shrink-0">
                                    <p className="text-[10px] font-black text-zinc-600 font-mono">{shift.start} – {shift.end}</p>
                                </div>

                                {/* Driver + vehicle */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{shift.driver}</p>
                                    <div className="flex items-center space-x-2 mt-0.5">
                                        <Truck size={10} className="text-zinc-400 dark:text-zinc-600" />
                                        <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-mono">{shift.vehicle}</p>
                                    </div>
                                </div>

                                {/* Route */}
                                <div className="hidden md:block flex-1 min-w-0">
                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-bold truncate">{shift.route}</p>
                                </div>

                                {/* Status badge */}
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest flex-shrink-0 ${cfg.badge}`}>
                                    {shift.status}
                                </span>

                                <ChevronRight size={14} className={`text-zinc-300 dark:text-zinc-700 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                            </div>

                            {/* Progress bar (always visible for active) */}
                            {(shift.status === 'ACTIVE' || isSelected) && (
                                <div className="mt-3 ml-6">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[9px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-widest">Route Progress</span>
                                        <span className="text-[9px] font-black text-zinc-500 dark:text-zinc-400">{shift.progress}%</span>
                                    </div>
                                    <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${cfg.bar} rounded-full transition-all duration-1000`}
                                            style={{ width: `${shift.progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
