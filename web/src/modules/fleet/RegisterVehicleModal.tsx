'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Truck, Hash, Weight, Activity } from 'lucide-react';
import { Vehicle } from './types';

interface RegisterVehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRegister: (vehicle: Vehicle) => void;
}

export const RegisterVehicleModal: React.FC<RegisterVehicleModalProps> = ({ isOpen, onClose, onRegister }) => {
    const [plateNumber, setPlateNumber] = useState('');
    const [model, setModel] = useState('Hino Ranger 500');
    const [payload, setPayload] = useState('15000');
    const [status, setStatus] = useState<'AVAILABLE' | 'MAINTENANCE' | 'OUT_OF_SERVICE'>('AVAILABLE');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newVehicle: Vehicle = {
            id: `v-${Math.random().toString(36).substr(2, 9)}`,
            plateNumber: plateNumber || 'B 0000 XYZ',
            model: model,
            type: model.includes('Hino') || model.includes('Isuzu Giga') ? 'HEAVY_TRUCK' : 'LIGHT_TRUCK',
            status: status === 'AVAILABLE' ? 'AVAILABLE' : status as any,
            lastMaintenance: new Date().toISOString().split('T')[0],
            nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            mileage: 0
        };
        onRegister(newVehicle);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-xl h-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl p-8 flex flex-col animate-in slide-in-from-right duration-500">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                            <Truck className="text-indigo-600 dark:text-indigo-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Register_Vehicle</h2>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Fleet Expansion Node</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors text-zinc-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form className="flex-1 space-y-8 overflow-y-auto pr-4 scrollbar-hide" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] px-1">Plate_Number</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <input
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    placeholder="B 1234 ABC"
                                    value={plateNumber}
                                    onChange={(e) => setPlateNumber(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] px-1">Vehicle_Model</label>
                            <select
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 px-4 text-sm font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                            >
                                <option>Hino Ranger 500</option>
                                <option>Isuzu Giga FVR</option>
                                <option>Mitsubishi Fuso Fighter</option>
                                <option>Mercedes-Benz Axor</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] px-1">Max_Payload (KG)</label>
                            <div className="relative">
                                <Weight className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <input
                                    type="number"
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    placeholder="15000"
                                    value={payload}
                                    onChange={(e) => setPayload(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] px-1">Initial_Status</label>
                            <div className="relative">
                                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <select
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                >
                                    <option value="AVAILABLE">Active / Idle</option>
                                    <option value="MAINTENANCE">In Maintenance</option>
                                    <option value="OUT_OF_SERVICE">Out of Service</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl">
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold leading-relaxed">
                            <span className="text-indigo-600 dark:text-indigo-400 font-black">SYSTEM_NOTE:</span> Registering a new vehicle automatically initializes telemetry hooks and assigns a unique UUID for real-time tracking across the Global Logistics Network.
                        </p>
                    </div>

                    <div className="pt-8 mt-auto flex space-x-4">
                        <Button type="button" variant="secondary" className="flex-1 py-7 text-xs font-black uppercase tracking-widest rounded-2xl" onClick={onClose}>
                            Abort_Entry
                        </Button>
                        <Button type="submit" className="flex-1 py-7 text-xs font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 rounded-2xl">
                            Confirm_Registration
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
