'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Driver, DriverStatus } from './types';
import { Star, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

const statusVariants: Record<DriverStatus, any> = {
    ACTIVE: 'success',
    ON_LEAVE: 'warning',
    SUSPENDED: 'error',
    OFF_DUTY: 'default',
};

const mockDrivers: Driver[] = [
    {
        id: 'd-1',
        name: 'Mike Ross',
        email: 'mike.ross@logistik.com',
        phone: '+62 812-3456-7890',
        licenseNumber: 'SIM-A-992384',
        licenseExpiry: '2026-12-31',
        status: 'ACTIVE',
        rating: 4.8,
        totalDeliveries: 124,
    },
    {
        id: 'd-2',
        name: 'Harvey Specter',
        email: 'harvey.s@logistik.com',
        phone: '+62 812-9988-7766',
        licenseNumber: 'SIM-B-112233',
        licenseExpiry: '2026-03-15',
        status: 'ACTIVE',
        rating: 4.9,
        totalDeliveries: 450,
    },
    {
        id: 'd-3',
        name: 'Louis Litt',
        email: 'louis.litt@logistik.com',
        phone: '+62 855-4433-2211',
        licenseNumber: 'SIM-A-004455',
        licenseExpiry: '2026-02-10', // Expired in simulation
        status: 'SUSPENDED',
        rating: 3.2,
        totalDeliveries: 89,
    }
];

export const DriverList: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockDrivers.map((driver) => {
                const isLicenseExpiring = new Date(driver.licenseExpiry) < new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);

                return (
                    <div key={driver.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 hover:border-indigo-500/30 transition-all group shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center font-black text-zinc-400 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all">
                                    {driver.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-black text-zinc-900 dark:text-white truncate">{driver.name}</h4>
                                    <p className="text-[10px] text-zinc-500 font-bold truncate">{driver.email}</p>
                                </div>
                            </div>
                            <Badge variant={statusVariants[driver.status]}>{driver.status}</Badge>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span className="text-zinc-400 dark:text-zinc-600">License_No.</span>
                                <span className="text-zinc-900 dark:text-zinc-300 font-mono">{driver.licenseNumber}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span className="text-zinc-400 dark:text-zinc-600">Expiry_Date</span>
                                <span className={`font-mono ${isLicenseExpiring ? 'text-red-600 dark:text-red-500' : 'text-zinc-900 dark:text-zinc-300'}`}>
                                    {driver.licenseExpiry}
                                    {isLicenseExpiring && <ShieldAlert size={12} className="inline ml-1 mb-0.5" />}
                                </span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
                            <div className="flex items-center">
                                <Star size={14} className="text-amber-500 fill-amber-500 mr-2" />
                                <span className="text-sm font-black text-zinc-900 dark:text-white">{driver.rating}</span>
                            </div>
                            <div className="flex items-center text-zinc-400 dark:text-zinc-600 space-x-2">
                                <CheckCircle2 size={14} className="text-emerald-500" />
                                <span className="font-black text-zinc-900 dark:text-zinc-400 text-xs">{driver.totalDeliveries}</span>
                                <span className="uppercase tracking-[0.2em] text-[8px] font-black">Deliveries</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
