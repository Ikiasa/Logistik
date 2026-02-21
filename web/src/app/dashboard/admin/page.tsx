'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AuditLogTable } from '@/modules/admin/AuditLogTable';
import { UserManagement } from '@/modules/admin/UserManagement';
import { Shield, Settings, History, Users, Activity, Heart, Server } from 'lucide-react';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'audit' | 'users' | 'settings'>('audit');

    const tabs = [
        { id: 'audit', label: 'Security Audit', icon: History },
        { id: 'users', label: 'User Directory', icon: Users },
        { id: 'settings', label: 'Tenant Settings', icon: Settings },
    ] as const;

    return (
        <DashboardLayout>
            <Breadcrumbs items={[{ label: 'Administration' }]} />

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
                        <Shield className="text-red-600 dark:text-red-400" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Control_Center</h1>
                        <p className="text-zinc-500 font-bold mt-1">System oversight, RLS verification, and user access control.</p>
                    </div>
                </div>

                {/* System Health Mini-Widget */}
                <div className="flex items-center space-x-6 bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-900 rounded-2xl px-6 py-3 shadow-sm">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Core_Engine</span>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-xs font-black text-zinc-900 dark:text-white uppercase">Healthy</span>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-zinc-100 dark:bg-zinc-900"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">API_Latency</span>
                        <span className="text-xs font-mono font-black text-zinc-500 dark:text-zinc-400">24ms</span>
                    </div>
                </div>
            </div>

            {/* Custom Tab Navigation */}
            <div className="flex space-x-1 p-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl w-fit mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                            ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                            : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
                            }`}
                    >
                        <tab.icon size={14} />
                        <span>{tab.label.replace(' ', '_')}</span>
                    </button>
                ))}
            </div>

            <div className="space-y-6">
                {activeTab === 'audit' && <AuditLogTable />}
                {activeTab === 'users' && <UserManagement />}
                {activeTab === 'settings' && (
                    <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl mb-6 shadow-inner">
                            <Settings className="text-zinc-400 dark:text-zinc-600 animate-spin-slow" size={32} />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2 uppercase tracking-tight">Tenant_Configuration</h3>
                        <p className="text-zinc-500 font-bold max-w-md">
                            Global settings for this tenant (currency, timezones, and integrations) are managed by the Root System Administrator.
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
