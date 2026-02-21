'use client';

import React, { useState } from 'react';
import { AlertTriangle, MapPin, Camera, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

export const IncidentForm: React.FC<{ onCancel: () => void; onSuccess: () => void }> = ({ onCancel, onSuccess }) => {
    const { user } = useAuthStore();
    const [type, setType] = useState('ACCIDENT');
    const [severity, setSeverity] = useState('MEDIUM');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            const token = `mock-jwt|${user.id}|${user.tenantId}|${user.email}`;
            // Simulating location for demo
            const lat = -6.200000;
            const lng = 106.816666;

            await axios.post('http://localhost:3000/api/ops/sop/incident', {
                vehicle_id: 'v1',
                type,
                severity,
                description,
                lat,
                lng,
                photos: [] // In real app, handle file uploads
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess();
        } catch (error) {
            console.error('Failed to report incident:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <AlertTriangle className="text-rose-600 dark:text-red-500" size={24} />
                    <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Report_Incident</h2>
                </div>
                <button onClick={onCancel} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Incident Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 text-zinc-900 dark:text-white font-bold outline-none focus:border-red-500 transition-colors appearance-none"
                    >
                        <option value="ACCIDENT">ACCIDENT</option>
                        <option value="BREAKDOWN">BREAKDOWN</option>
                        <option value="FUEL_THEFT">FUEL_THEFT</option>
                        <option value="MISC">OTHER_OPERATIONAL</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Severity Level</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['LOW', 'MEDIUM', 'HIGH'].map(s => (
                            <button
                                key={s}
                                onClick={() => setSeverity(s)}
                                className={`p-3 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${severity === s ? 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-500' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:border-zinc-200 dark:hover:border-zinc-700'}`}
                            >{s}</button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Details of the incident..."
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 text-zinc-900 dark:text-white text-xs outline-none focus:border-red-500 transition-colors h-24 resize-none placeholder-zinc-300 dark:placeholder-zinc-700"
                    ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl flex items-center justify-center space-x-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer group transition-all">
                        <Camera size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Attach_Photo</span>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl flex items-center justify-center space-x-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer group transition-all">
                        <MapPin size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Ping_Location</span>
                    </div>
                </div>
            </div>

            <Button
                variant="primary"
                className="w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] bg-red-600 hover:bg-red-700"
                onClick={handleSubmit}
                disabled={isSubmitting || !description}
            >
                {isSubmitting ? 'Transmitting...' : 'Dispatch_Incident_Alert'}
            </Button>
        </div>
    );
};
