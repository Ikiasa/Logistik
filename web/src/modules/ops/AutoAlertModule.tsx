'use client';
import React, { useState, useEffect } from 'react';
import { AlertTriangle, RssIcon, CheckCheck, Volume2, X, AlertCircle, Info, Zap } from 'lucide-react';

type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

interface OpsAlert {
    id: string;
    severity: AlertSeverity;
    title: string;
    detail: string;
    vehicleId?: string;
    ts: number;
    dismissed: boolean;
    rule: string;
}

const SEED_ALERTS: OpsAlert[] = [
    { id: 'A-001', severity: 'CRITICAL', title: 'Overspeed Detected', detail: 'B 9012 GHI exceeded 115 km/h on Tol Cipularang KM 88', vehicleId: 'B 9012 GHI', ts: Date.now() - 90000, dismissed: false, rule: 'SPEED > 110 KM/H' },
    { id: 'A-002', severity: 'WARNING', title: 'Engine Temp High', detail: 'B 3456 JKL engine at 98°C — coolant check recommended', vehicleId: 'B 3456 JKL', ts: Date.now() - 240000, dismissed: false, rule: 'ENGINE_TEMP > 95°C' },
    { id: 'A-003', severity: 'WARNING', title: 'Fuel Low', detail: 'B 7890 MNO estimated 42km remaining on current route', vehicleId: 'B 7890 MNO', ts: Date.now() - 480000, dismissed: false, rule: 'FUEL < 15%' },
    { id: 'A-004', severity: 'INFO', title: 'Driver Break Due', detail: 'Budi Santoso approaching 4h continuous drive — break required', vehicleId: 'B 1234 ABC', ts: Date.now() - 720000, dismissed: false, rule: 'DRIVE_HOURS > 4H' },
    { id: 'A-005', severity: 'INFO', title: 'Route Deviation', detail: 'B 2468 PQR deviated 3.2km from planned route near Cibinong', vehicleId: 'B 2468 PQR', ts: Date.now() - 1200000, dismissed: false, rule: 'GEOFENCE_EXIT' },
];

const SEVERITY_CONFIG: Record<AlertSeverity, { icon: React.ElementType; border: string; bg: string; badge: string; text: string }> = {
    CRITICAL: { icon: AlertCircle, border: 'border-rose-500/30', bg: 'bg-rose-500/5', badge: 'bg-rose-500 text-white', text: 'text-rose-600 dark:text-rose-400' },
    WARNING: { icon: AlertTriangle, border: 'border-amber-500/30', bg: 'bg-amber-500/5', badge: 'bg-amber-500 text-white', text: 'text-amber-600 dark:text-amber-400' },
    INFO: { icon: Info, border: 'border-indigo-500/20', bg: 'bg-indigo-500/5', badge: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30', text: 'text-indigo-600 dark:text-indigo-400' },
};

function timeAgo(ts: number) {
    const secs = Math.floor((Date.now() - ts) / 1000);
    if (secs < 60) return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    return `${Math.floor(secs / 3600)}h ago`;
}

export const AutoAlertModule: React.FC = () => {
    const [alerts, setAlerts] = useState<OpsAlert[]>(SEED_ALERTS);
    const [filter, setFilter] = useState<AlertSeverity | 'ALL'>('ALL');
    const [muted, setMuted] = useState(false);

    // Simulate new incoming alerts
    useEffect(() => {
        const NEW_ALERTS: Omit<OpsAlert, 'id' | 'ts' | 'dismissed'>[] = [
            { severity: 'WARNING', title: 'Harsh Braking', detail: 'B 1357 STU detected harsh braking event on Jl. Sudirman', vehicleId: 'B 1357 STU', rule: 'G-FORCE > 0.6G' },
            { severity: 'INFO', title: 'Delivery ETA Updated', detail: 'FL-998 ETA revised to 18:45 (+23 min) due to traffic', vehicleId: 'B 9012 GHI', rule: 'ETA_DRIFT > 15M' },
        ];
        let idx = 0;
        const timer = setInterval(() => {
            if (idx >= NEW_ALERTS.length) { clearInterval(timer); return; }
            const alert = NEW_ALERTS[idx++];
            setAlerts(prev => [{ ...alert, id: `A-NEW-${idx}`, ts: Date.now(), dismissed: false }, ...prev]);
        }, 12000);
        return () => clearInterval(timer);
    }, []);

    const dismiss = (id: string) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } : a));
    const dismissAll = () => setAlerts(prev => prev.map(a => ({ ...a, dismissed: true })));

    const visible = alerts.filter(a => !a.dismissed && (filter === 'ALL' || a.severity === filter));
    const counts = { CRITICAL: alerts.filter(a => !a.dismissed && a.severity === 'CRITICAL').length, WARNING: alerts.filter(a => !a.dismissed && a.severity === 'WARNING').length, INFO: alerts.filter(a => !a.dismissed && a.severity === 'INFO').length };

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center space-x-3">
                    <Zap size={16} className="text-amber-600 dark:text-amber-400" />
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white">Auto_Alert_Module</h2>
                    {counts.CRITICAL > 0 && (
                        <span className="w-5 h-5 bg-rose-500 rounded-full text-[9px] font-black text-white flex items-center justify-center animate-pulse">
                            {counts.CRITICAL}
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setMuted(m => !m)} className={`p-1.5 rounded-lg transition-all ${muted ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                        <Volume2 size={14} />
                    </button>
                    <button onClick={dismissAll} className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 uppercase tracking-widest px-2 py-1 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
                        Clear All
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-1 px-4 py-3 border-b border-zinc-50 dark:border-zinc-900">
                {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg transition-all ${filter === f ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400'}`}
                    >
                        {f} {f !== 'ALL' && counts[f] > 0 && `(${counts[f]})`}
                    </button>
                ))}
            </div>

            {/* Alert list */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-zinc-50 dark:divide-zinc-900">
                {visible.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-zinc-300 dark:text-zinc-700">
                        <CheckCheck size={24} className="mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">All Clear</p>
                    </div>
                ) : (
                    visible.map(alert => {
                        const cfg = SEVERITY_CONFIG[alert.severity];
                        const Icon = cfg.icon;
                        return (
                            <div key={alert.id} className={`flex items-start space-x-3 px-5 py-4 ${cfg.bg} border-l-2 ${cfg.border} transition-all`}>
                                <Icon size={14} className={`${cfg.text} mt-0.5 flex-shrink-0`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-0.5">
                                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${cfg.badge}`}>{alert.severity}</span>
                                        <span className="text-[9px] text-zinc-400 dark:text-zinc-600 font-mono">{timeAgo(alert.ts)}</span>
                                        {alert.vehicleId && <span className="text-[9px] text-zinc-400 dark:text-zinc-700 font-mono">{alert.vehicleId}</span>}
                                    </div>
                                    <p className="text-xs font-bold text-zinc-900 dark:text-white">{alert.title}</p>
                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-0.5">{alert.detail}</p>
                                    <p className="text-[9px] text-zinc-300 dark:text-zinc-700 font-mono mt-1">RULE: {alert.rule}</p>
                                </div>
                                <button onClick={() => dismiss(alert.id)} className="text-zinc-300 dark:text-zinc-700 hover:text-zinc-600 dark:hover:text-zinc-400 flex-shrink-0 p-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-all">
                                    <X size={12} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
