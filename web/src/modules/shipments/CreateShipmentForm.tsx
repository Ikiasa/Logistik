'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Trash2, Plus, ArrowRight, DollarSign, Package } from 'lucide-react';
import { Stop } from './types';

interface CreateShipmentFormProps {
    onSuccess?: () => void;
}

export const CreateShipmentForm: React.FC<CreateShipmentFormProps> = ({ onSuccess }) => {
    const [stops, setStops] = useState<Partial<Stop>[]>([
        { id: '1', type: 'PICKUP', sequence: 1, locationName: '' },
        { id: '2', type: 'DROPOFF', sequence: 2, locationName: '' }
    ]);
    const [weight, setWeight] = useState(0);
    const [revenueCents, setRevenueCents] = useState(0);

    const addStop = () => {
        const newStop: Partial<Stop> = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'TRANSIT',
            sequence: stops.length + 1,
            locationName: ''
        };
        setStops([...stops, newStop]);
    };

    const removeStop = (id: string) => {
        if (stops.length <= 2) return;
        setStops(stops.filter(s => s.id !== id).map((s, idx) => ({ ...s, sequence: idx + 1 })));
    };

    const updateStop = (id: string, field: keyof Stop, value: string) => {
        setStops(stops.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    useEffect(() => {
        // Auto-pricing logic (Simulation)
        // $10 per kg + $50 per stop
        const total = (weight * 1000) + (stops.length * 5000);
        setRevenueCents(total);
    }, [weight, stops]);

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 space-y-8 shadow-sm">
            <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                    <Package className="text-indigo-600 dark:text-indigo-400" size={20} />
                </div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Route_Construction</h3>
            </div>

            <div className="space-y-4">
                {stops.map((stop, index) => (
                    <div key={stop.id} className="flex items-center space-x-4 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${stop.type === 'PICKUP' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400' :
                                stop.type === 'DROPOFF' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400' :
                                    'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500'
                                }`}>
                                {stop.sequence}
                            </div>
                            {index < stops.length - 1 && <div className="w-0.5 h-12 bg-zinc-100 dark:bg-zinc-800 my-1"></div>}
                        </div>

                        <div className="flex-1 grid grid-cols-12 gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 border border-zinc-100 dark:border-zinc-800/50 rounded-2xl">
                            <div className="col-span-3">
                                <label className="block text-[10px] uppercase font-black text-zinc-400 dark:text-zinc-600 mb-1">Type</label>
                                <select
                                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg py-1.5 px-3 text-xs font-bold text-zinc-900 dark:text-zinc-300 outline-none"
                                    value={stop.type}
                                    onChange={(e) => updateStop(stop.id!, 'type' as any, e.target.value)}
                                >
                                    <option value="PICKUP">Pickup</option>
                                    <option value="TRANSIT">Transit</option>
                                    <option value="DROPOFF">Dropoff</option>
                                </select>
                            </div>
                            <div className="col-span-8">
                                <label className="block text-[10px] uppercase font-black text-zinc-400 dark:text-zinc-600 mb-1">Location / Port</label>
                                <input
                                    type="text"
                                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg py-1.5 px-3 text-xs font-bold text-zinc-900 dark:text-zinc-300 placeholder-zinc-300 dark:placeholder-zinc-700 outline-none"
                                    placeholder="Enter address or GPS coords..."
                                    value={stop.locationName}
                                    onChange={(e) => updateStop(stop.id!, 'locationName' as any, e.target.value)}
                                />
                            </div>
                            <div className="col-span-1 flex items-end justify-center pb-1">
                                <button
                                    onClick={() => removeStop(stop.id!)}
                                    className="text-zinc-300 dark:text-zinc-700 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={addStop}
                    className="flex items-center text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mt-4 transition-colors px-12 uppercase tracking-widest"
                >
                    <Plus size={16} className="mr-2" /> Add_Intermediate_Stop
                </button>
            </div>

            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-8">
                <div>
                    <label className="block text-[10px] uppercase font-black text-zinc-400 dark:text-zinc-500 mb-2">Total Payload (KG)</label>
                    <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-4 text-xl font-black text-indigo-600 dark:text-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 flex flex-col justify-center shadow-inner">
                    <p className="text-[10px] uppercase font-black text-zinc-400 dark:text-zinc-600">Estimated Revenue</p>
                    <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-black text-zinc-900 dark:text-white font-mono tracking-tighter decoration-emerald-500/30 underline underline-offset-8 transform hover:scale-105 transition-transform cursor-pointer">
                            ${(revenueCents / 100).toFixed(2)}
                        </span>
                        <span className="text-[10px] font-black text-zinc-500 uppercase">USD</span>
                    </div>
                </div>
            </div>

            <Button className="w-full py-8 text-lg font-black uppercase tracking-[0.2em] bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 rounded-2xl group transition-all">
                Dispatch_Shipment <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={24} />
            </Button>
        </div>
    );
};
