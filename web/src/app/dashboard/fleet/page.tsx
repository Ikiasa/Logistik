'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { VehicleTable, mockVehicles } from '@/modules/fleet/VehicleTable';
import { KPI } from '@/components/ui/KPI';
import { Truck, AlertTriangle, CheckCircle2, Factory, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RegisterVehicleModal } from '@/modules/fleet/RegisterVehicleModal';
import { Vehicle } from '@/modules/fleet/types';

export default function FleetPage() {
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);

    const handleRegister = (newVehicle: Vehicle) => {
        setVehicles(prev => [newVehicle, ...prev]);
    };

    return (
        <DashboardLayout>
            <Breadcrumbs items={[{ label: 'Fleet Management' }]} />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Fleet_Intelligence</h1>
                    <p className="text-zinc-500 font-bold mt-1">Vehicle health monitoring and maintenance scheduling.</p>
                </div>
                <Button
                    onClick={() => setIsRegisterOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-xl shadow-indigo-600/10 rounded-2xl px-8 py-7 text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="mr-2" size={18} /> Register_New_Vehicle
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <KPI title="Total Fleet" value={vehicles.length} icon={Truck} description="Active vehicles" variant="primary" />
                <KPI title="Available" value={vehicles.filter(v => v.status === 'AVAILABLE').length} icon={CheckCircle2} trend={{ value: 4, isUp: true }} variant="success" />
                <KPI title="Maintenance" value={vehicles.filter(v => v.status === 'MAINTENANCE').length} icon={Factory} variant="warning" />
                <KPI title="Late Service" value="3" icon={AlertTriangle} trend={{ value: 2, isUp: false }} variant="error" />
            </div>

            <VehicleTable vehicles={vehicles} />

            <RegisterVehicleModal
                isOpen={isRegisterOpen}
                onClose={() => setIsRegisterOpen(false)}
                onRegister={handleRegister}
            />
        </DashboardLayout>
    );
}
