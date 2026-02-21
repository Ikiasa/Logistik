'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { WarehouseKPIStrip } from '@/modules/wms/WarehouseKPIStrip';
import { WarehouseBrain } from '@/modules/wms/WarehouseBrain';
import { InboundWorkflow } from '@/modules/wms/InboundWorkflow';
import { OutboundPicking } from '@/modules/wms/OutboundPicking';
import { WarehouseVisualizer } from '@/modules/wms/WarehouseVisualizer';
import { ReorderAutomation } from '@/modules/wms/ReorderAutomation';
import { StockMovementList } from '@/modules/wms/StockMovementList';
import { Button } from '@/components/ui/Button';
import {
    Brain,
    Ship,
    PackageCheck,
    Map as MapIcon,
    Settings,
    Download
} from 'lucide-react';

type Tab = 'brain' | 'inbound' | 'outbound' | 'visualizer';

export default function WarehousePage() {
    const [activeTab, setActiveTab] = useState<Tab>('brain');

    const tabs = [
        { id: 'brain' as const, label: 'Warehouse Brain', icon: Brain },
        { id: 'inbound' as const, label: 'Inbound Engine', icon: Ship },
        { id: 'outbound' as const, label: 'Picking Engine', icon: PackageCheck },
        { id: 'visualizer' as const, label: 'Map Visualizer', icon: MapIcon },
    ];

    return (
        <DashboardLayout>
            <Breadcrumbs items={[{ label: 'Warehouse Brain (Gen-4 Intelligence)' }]} />

            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-[0_0_20px_rgba(79,70,229,0.1)]">
                        <Brain className="text-indigo-600 dark:text-indigo-400" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">Warehouse Brain</h1>
                        <p className="text-zinc-500 mt-1 font-medium italic">Autonomous stock intelligence & multi-zone orchestration.</p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <Button variant="secondary" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-sm">
                        <Download size={18} className="mr-2" /> Export Inventory
                    </Button>
                    <Button className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 border-none px-6 shadow-sm">
                        <Settings size={18} className="mr-2" /> WMS Settings
                    </Button>
                </div>
            </div>

            {/* Layer 1: KPI Intelligence */}
            <WarehouseKPIStrip />

            {/* Layer 2: Main Workflow Tabs */}
            <div className="mb-6 flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-1 rounded-2xl w-fit shadow-sm">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-400'
                                }`}
                        >
                            <Icon size={14} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Dynamic Content Layer */}
                <div className="lg:col-span-8">
                    {activeTab === 'brain' && <WarehouseBrain />}
                    {activeTab === 'inbound' && <InboundWorkflow />}
                    {activeTab === 'outbound' && <OutboundPicking />}
                    {activeTab === 'visualizer' && <WarehouseVisualizer />}
                </div>

                {/* Layer 3: Side Intelligence Panels */}
                <div className="lg:col-span-4 space-y-8">
                    <ReorderAutomation />
                    <StockMovementList />
                </div>
            </div>
        </DashboardLayout>
    );
}
