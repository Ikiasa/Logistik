'use client';
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ShiftTimeline } from '@/modules/ops/ShiftTimeline';
import { TelemetryPanel } from '@/modules/ops/TelemetryPanel';
import { AutoAlertModule } from '@/modules/ops/AutoAlertModule';
import { IncidentWorkflowModal } from '@/modules/ops/IncidentWorkflowModal';
import { PerformanceSnapshot } from '@/modules/ops/PerformanceSnapshot';
import { Shield, AlertCircle, Radio, Activity, Clock, TrendingUp } from 'lucide-react';

export default function FleetOpsPage() {
    const [showIncident, setShowIncident] = useState(false);

    return (
        <DashboardLayout>
            {/* ── Page Header ── */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <Breadcrumbs items={[
                        { label: 'Fleet Operations', href: '/dashboard/fleet' },
                        { label: 'Operational Node' }
                    ]} />
                    <div className="mt-4 flex items-center space-x-4">
                        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                            <Shield size={22} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase">
                                Operational_<span className="text-indigo-600 dark:text-indigo-500">Node</span>
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">Live dispatch, telemetry, alert management &amp; performance intelligence</p>
                        </div>
                    </div>
                </div>

                {/* Quick status bar */}
                <div className="hidden lg:flex items-center space-x-3">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                        <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">2 Active Shifts</span>
                    </div>
                    <button
                        onClick={() => setShowIncident(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/50 rounded-xl text-rose-600 dark:text-rose-400 transition-all group"
                    >
                        <AlertCircle size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Signal Incident</span>
                    </button>
                </div>
            </div>

            {/* ── Section tabs (mobile quick access) ── */}
            <div className="flex lg:hidden space-x-2 mb-6 overflow-x-auto pb-2">
                {[
                    { icon: Clock, label: 'Shifts' },
                    { icon: Activity, label: 'Telemetry' },
                    { icon: Radio, label: 'Alerts' },
                    { icon: TrendingUp, label: 'Performance' },
                ].map(({ icon: Icon, label }) => (
                    <button key={label} className="flex items-center space-x-1.5 px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex-shrink-0">
                        <Icon size={12} className="text-zinc-500 dark:text-zinc-400" />
                        <span className="text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{label}</span>
                    </button>
                ))}
            </div>

            {/* ══ Main Layout ══ */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* ── LEFT column (wide) ── */}
                <div className="xl:col-span-7 space-y-6">

                    {/* 1. Shift Timeline */}
                    <ShiftTimeline />

                    {/* 3. Auto Alert Module */}
                    <AutoAlertModule />

                </div>

                {/* ── RIGHT column (narrow) ── */}
                <div className="xl:col-span-5 space-y-6">

                    {/* 2. Real-Time Telemetry */}
                    <TelemetryPanel />

                    {/* Mobile "Signal Incident" button */}
                    <button
                        onClick={() => setShowIncident(true)}
                        className="lg:hidden w-full flex items-center justify-center space-x-3 py-4 bg-rose-500/5 border-2 border-dashed border-rose-500/20 hover:border-rose-500/50 rounded-3xl text-rose-600 dark:text-rose-400 transition-all group"
                    >
                        <AlertCircle size={18} />
                        <span className="text-sm font-black uppercase tracking-widest">Signal_Incident</span>
                    </button>

                    {/* 5. Performance Snapshot — fits in right column on large */}
                    <div className="xl:hidden">
                        <PerformanceSnapshot />
                    </div>

                </div>
            </div>

            {/* 5. Performance Snapshot — full width below on xl screens */}
            <div className="hidden xl:block mt-6">
                <PerformanceSnapshot />
            </div>

            {/* ── 4. Incident Workflow Modal ── */}
            {showIncident && (
                <IncidentWorkflowModal onClose={() => setShowIncident(false)} />
            )}
        </DashboardLayout>
    );
}
