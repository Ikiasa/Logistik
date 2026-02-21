'use client';
import React from 'react';
import { Brain, AlertTriangle, TrendingUp, TrendingDown, CheckCircle2, Zap } from 'lucide-react';
import { FLEET_UNITS, TODAY_KPIS, IDLE_COST_PER_HOUR } from './intelligence.data';

interface Insight {
    id: string;
    type: 'opportunity' | 'alert' | 'trend' | 'achievement';
    title: string;
    detail: string;
    impact?: string;
    priority: number; // higher = more important
}

function generateInsights(): Insight[] {
    const negMarginUnits = FLEET_UNITS.filter(u => u.margin < 0);
    const highIdle = FLEET_UNITS.filter(u => u.idleHours > 6);
    const highUtil = FLEET_UNITS.filter(u => u.utilization >= 90);
    const topIdleHours = FLEET_UNITS.reduce((sum, u) => sum + u.idleHours, 0);
    const totalIdleCost = topIdleHours * IDLE_COST_PER_HOUR;

    return [
        {
            id: 'i-1',
            type: 'alert' as const,
            title: `${negMarginUnits.length} Unit${negMarginUnits.length > 1 ? 's' : ''} Running at Negative Margin`,
            detail: `${negMarginUnits.map(u => u.plate).join(', ')} are costing more than revenue. Review pricing or reassign routes.`,
            impact: `Potential loss: Rp ${(negMarginUnits.reduce((s, u) => s + (u.cost - u.revenue), 0) / 1_000_000).toFixed(1)}M/day`,
            priority: 10,
        },
        {
            id: 'i-2',
            type: 'opportunity' as const,
            title: `Idle Cost Optimization: Rp ${(totalIdleCost / 1_000_000).toFixed(1)}M Recoverable`,
            detail: `${highIdle.length} trucks idle >6h/day. Reducing idle by 30% saves ~Rp ${(totalIdleCost * 0.3 / 1_000_000).toFixed(1)}M/day`,
            impact: `Monthly savings: Rp ${(totalIdleCost * 0.3 * 22 / 1_000_000).toFixed(0)}M`,
            priority: 9,
        },
        {
            id: 'i-3',
            type: 'trend' as const,
            title: 'Revenue Trending Up +12.3% vs Last Week',
            detail: 'Strong improvement driven by Jawa Timur and Sumatera regions. Fleet utilization improvement of +8.4pp is the key driver.',
            impact: undefined,
            priority: 7,
        },
        {
            id: 'i-4',
            type: 'achievement' as const,
            title: `${highUtil.length} Units at Peak Performance (≥90% Utilization)`,
            detail: `${highUtil.map(u => u.driver.split(' ')[0]).join(', ')} are your top performers. Use their routes as template for underperformers.`,
            impact: `Avg margin: ${(highUtil.reduce((s, u) => s + u.margin, 0) / highUtil.length).toFixed(1)}%`,
            priority: 6,
        },
        {
            id: 'i-5',
            type: 'opportunity' as const,
            title: 'Sumatera Route Has Highest Margin Variance',
            detail: 'BK region shows 99.6pp margin spread (−7.3% to +43.4%). Reassigning drivers or adjusting route pricing could close the gap.',
            impact: 'Margin uplift potential: +12pp',
            priority: 5,
        },
    ].sort((a, b) => b.priority - a.priority);
}

const TYPE_CONFIG = {
    alert: { icon: AlertTriangle, color: 'text-rose-600 dark:text-rose-400', border: 'border-l-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/5', badge: 'bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400' },
    opportunity: { icon: Zap, color: 'text-amber-600 dark:text-amber-400', border: 'border-l-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/5', badge: 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400' },
    trend: { icon: TrendingUp, color: 'text-indigo-600 dark:text-indigo-400', border: 'border-l-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/5', badge: 'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400' },
    achievement: { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', border: 'border-l-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/5', badge: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
};

export const SmartInsightPanel: React.FC = () => {
    const insights = generateInsights();

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center space-x-3 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                    <Brain size={16} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white">Smart_Insight_Panel</h3>
                    <p className="text-[9px] text-zinc-400 dark:text-zinc-600 font-bold">{insights.length} intelligent insights generated from fleet data</p>
                </div>
            </div>

            {/* Insights */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {insights.map((insight, i) => {
                    const cfg = TYPE_CONFIG[insight.type];
                    const Icon = cfg.icon;
                    return (
                        <div key={insight.id} className={`flex items-start space-x-4 px-5 py-4 border-l-2 ${cfg.border} ${cfg.bg} transition-all hover:brightness-105 dark:hover:brightness-110`}>
                            {/* Priority rank */}
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm">
                                <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500">{i + 1}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1 flex-wrap gap-1">
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg ${cfg.badge}`}>
                                        {insight.type}
                                    </span>
                                    <Icon size={12} className={cfg.color} />
                                </div>
                                <p className="text-xs font-bold text-zinc-900 dark:text-white mb-1">{insight.title}</p>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">{insight.detail}</p>
                                {insight.impact && (
                                    <p className={`text-[9px] font-black mt-2 ${cfg.color} uppercase tracking-tight`}>
                                        → {insight.impact}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
