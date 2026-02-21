'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { DriverList } from '@/modules/fleet/DriverList';
import { Button } from '@/components/ui/Button';
import { Users, UserPlus } from 'lucide-react';

export default function DriversPage() {
    return (
        <DashboardLayout>
            <Breadcrumbs items={[{ label: 'Driver Operations' }]} />

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                        <Users className="text-emerald-600 dark:text-emerald-400" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Driver_Network</h1>
                        <p className="text-zinc-500 font-bold mt-1">Monitoring compliance, performance, and availability.</p>
                    </div>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-sm rounded-xl text-[10px] font-black uppercase tracking-widest">
                    <UserPlus size={16} className="mr-2" /> Onboard_Driver
                </Button>
            </div>

            <DriverList />
        </DashboardLayout>
    );
}
