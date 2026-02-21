'use client';

import React, { useState } from 'react';
import { ClipboardCheck, Truck, ShieldAlert, Camera, PenTool, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

export const SOPChecklist: React.FC = () => {
    const { user } = useAuthStore();
    const [step, setStep] = useState<'IDLE' | 'INSPECTION' | 'SHIFT_START' | 'ACTIVE'>('IDLE');
    const [odometer, setOdometer] = useState('');
    const [checklist, setChecklist] = useState({
        brakes: false,
        tires: false,
        lights: false,
        fluids: false,
        mirrors: false,
    });

    const handleStartShift = async () => {
        if (!user) return;
        try {
            const token = `mock-jwt|${user.id}|${user.tenantId}|${user.email}`;
            await axios.post('http://localhost:3000/api/ops/sop/shift/start', {
                vehicle_id: 'v1', // Hardcoded for demo/simulation
                odometer: Number(odometer),
                checklist: checklist
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStep('ACTIVE');
        } catch (error) {
            console.error('Failed to start shift:', error);
        }
    };

    if (step === 'IDLE') {
        return (
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center animate-pulse">
                    <Truck size={40} className="text-indigo-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Shift Ready</h2>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">Initialize Mandatory Internal SOP</p>
                </div>
                <Button variant="primary" className="px-12 py-6 rounded-2xl font-black uppercase tracking-[0.2em]" onClick={() => setStep('INSPECTION')}>
                    Begin SOP Verification
                </Button>
            </div>
        );
    }

    if (step === 'INSPECTION') {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                    <ClipboardCheck className="text-indigo-500" size={24} />
                    <h2 className="text-lg font-black text-white uppercase tracking-tighter">Pre-Trip_Inspection</h2>
                </div>

                <div className="space-y-3">
                    {Object.keys(checklist).map((item) => (
                        <div key={item} className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-indigo-500/30 transition-all cursor-pointer" onClick={() => setChecklist(prev => ({ ...prev, [item]: !prev[item as keyof typeof prev] }))}>
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{item.replace('_', ' ')}</span>
                            {checklist[item as keyof typeof checklist] ? <CheckCircle2 size={18} className="text-emerald-500" /> : <div className="w-4 h-4 rounded-full border border-zinc-700" />}
                        </div>
                    ))}
                </div>

                <div className="mt-8 space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Initial Odometer Reading</label>
                    <input
                        type="number"
                        placeholder="000,000"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white font-mono text-xl outline-none focus:border-indigo-500 transition-colors"
                        value={odometer}
                        onChange={(e) => setOdometer(e.target.value)}
                    />
                </div>

                <Button variant="primary" className="w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em]" onClick={handleStartShift} disabled={!odometer || !Object.values(checklist).every(v => v)}>
                    Confirm_&_Deploy
                </Button>
            </div>
        );
    }

    return (
        <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <ShieldAlert size={40} className="text-emerald-500" />
            </div>
            <div>
                <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Service_Active</h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">Telemetery Stream Locked & Verified</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col items-center justify-center space-y-2 group hover:border-red-500/50 cursor-pointer transition-all">
                    <ShieldAlert size={20} className="text-zinc-500 group-hover:text-red-500" />
                    <span className="text-[10px] font-black text-zinc-600 uppercase group-hover:text-red-500">Signal_Incident</span>
                </div>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col items-center justify-center space-y-2 group hover:border-indigo-500/50 cursor-pointer transition-all">
                    <Camera size={20} className="text-zinc-500 group-hover:text-indigo-400" />
                    <span className="text-[10px] font-black text-zinc-600 uppercase group-hover:text-indigo-400">Electronic_POD</span>
                </div>
            </div>
        </div>
    );
};
