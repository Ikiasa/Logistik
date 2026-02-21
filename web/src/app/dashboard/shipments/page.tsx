'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { ShipmentTable } from '@/modules/shipments/ShipmentTable';
import { CreateShipmentForm } from '@/modules/shipments/CreateShipmentForm';

export default function ShipmentsPage() {
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <DashboardLayout>
            <Breadcrumbs items={[{ label: 'Shipments' }]} />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Shipment_Management</h1>
                    <p className="text-zinc-500 font-bold mt-1">Manage and track multi-stop shipments across your fleet.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-sm rounded-xl text-[10px] font-black uppercase tracking-widest">
                    <Plus size={16} className="mr-2" /> New_Shipment
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    <ShipmentTable key={refreshKey} />
                </div>
                <div className="lg:col-span-4">
                    <CreateShipmentForm onSuccess={() => setRefreshKey(prev => prev + 1)} />
                </div>
            </div>
        </DashboardLayout>
    );
}
