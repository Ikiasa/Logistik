'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { KPI } from '@/components/ui/KPI';
import { InvoiceTable } from '@/modules/finance/InvoiceTable';
import { RateMatrixEditor } from '@/modules/finance/RateMatrix';
import { DollarSign, TrendingUp, CreditCard, Clock, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatIDR, formatNumber } from '@/lib/utils/format';
import { MarginTrendChart, CostBreakdownChart } from '@/modules/finance/MarginAnalytics';

export default function FinancePage() {
    return (
        <DashboardLayout>
            <Breadcrumbs items={[{ label: 'Finance & Billing' }]} />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Financial_Console</h1>
                    <p className="text-zinc-500 font-bold mt-1">Managing accounts receivable, revenue margins, and rating systems.</p>
                </div>
                <div className="flex space-x-3">
                    <Button variant="secondary" className="rounded-xl border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest">
                        <Download size={14} className="mr-2" /> Ledger Export
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-sm rounded-xl text-[10px] font-black uppercase tracking-widest">
                        Generate Invoices
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <KPI
                    title="Total Revenue"
                    value={formatIDR(12484000000)} // Mocked for IDR
                    icon={TrendingUp}
                    trend={{ value: 12, isUp: true }}
                    description="vs last month"
                />
                <KPI
                    title="Outstanding"
                    value={formatIDR(1425000000)} // Mocked for IDR
                    icon={CreditCard}
                    trend={{ value: 5, isUp: false }}
                    description="Pending payment"
                />
                <KPI
                    title="Profit Margin"
                    value="28.4%"
                    icon={DollarSign}
                    trend={{ value: 2, isUp: true }}
                />
                <KPI
                    title="Avg. Day-to-Pay"
                    value="14 Days"
                    icon={Clock}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 w-full">
                <MarginTrendChart />
                <CostBreakdownChart />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
                <div className="lg:col-span-2 w-full">
                    <InvoiceTable />
                </div>
                <div className="w-full grid grid-cols-1 gap-10">
                    <div className="w-full">
                        <RateMatrixEditor />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
