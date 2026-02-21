'use client';
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Brain, Download, ShieldCheck } from 'lucide-react';

// ── Intelligence modules ──
import { IntelKPIStrip } from '@/modules/analytics/IntelKPIStrip';
import { FleetEfficiencyMatrix } from '@/modules/analytics/FleetEfficiencyMatrix';
import { UnitProfitability } from '@/modules/analytics/UnitProfitability';
import { IdleCostAnalyzer } from '@/modules/analytics/IdleCostAnalyzer';
import { TrendIntelligence } from '@/modules/analytics/TrendIntelligence';
import { SmartInsightPanel } from '@/modules/analytics/SmartInsightPanel';

export default function FleetIntelligencePage() {
    return (
        <DashboardLayout>
            <div className="space-y-8 pb-16">

                {/* ── Page Header ── */}
                <div className="flex items-start justify-between">
                    <div>
                        <Breadcrumbs items={[
                            { label: 'Fleet Operations', href: '/dashboard/fleet' },
                            { label: 'Intelligence & Efficiency Matrix' }
                        ]} />
                        <div className="flex items-center space-x-4 mt-4">
                            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                                <Brain size={22} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase">
                                    Fleet_<span className="text-indigo-500">Intelligence</span>
                                </h1>
                                <p className="text-zinc-500 text-sm mt-0.5 font-medium">3-layer command dashboard — KPIs, efficiency matrix & trend analytics</p>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center space-x-3 pt-2">
                        <button className="flex items-center space-x-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">
                            <Download size={14} />
                            <span>Export PDF</span>
                        </button>
                        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                            <ShieldCheck size={20} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════
                    LAYER 1 — Executive KPI Strip (12 cols)
                    ══════════════════════════════════════════ */}
                <section>
                    <IntelKPIStrip />
                </section>

                {/* ══════════════════════════════════════════
                    LAYER 2 — Core Analysis (12 col grid)
                    ══════════════════════════════════════════ */}
                <section className="grid grid-cols-12 gap-6">
                    {/* Fleet Efficiency Matrix — 8 cols */}
                    <div className="col-span-12 xl:col-span-8">
                        <FleetEfficiencyMatrix />
                    </div>

                    {/* Right sidebar — 4 cols: Idle Cost + Unit Profitability */}
                    <div className="col-span-12 xl:col-span-4 space-y-6">
                        <IdleCostAnalyzer />
                        <UnitProfitability />
                    </div>
                </section>

                {/* ══════════════════════════════════════════
                    LAYER 3 — Intelligence & Trends (12 cols)
                    ══════════════════════════════════════════ */}
                <section className="grid grid-cols-12 gap-6">
                    {/* Trend Intelligence — 7 cols */}
                    <div className="col-span-12 xl:col-span-7">
                        <TrendIntelligence />
                    </div>

                    {/* Smart Insight Panel — 5 cols */}
                    <div className="col-span-12 xl:col-span-5">
                        <SmartInsightPanel />
                    </div>
                </section>

            </div>
        </DashboardLayout>
    );
}
