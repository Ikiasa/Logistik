'use client';

import React, { useState } from 'react';
import { PackageCheck, User, PenTool, Camera, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

export const PODVerification: React.FC<{ shipmentId: string; onCancel: () => void; onSuccess: () => void }> = ({ shipmentId, onCancel, onSuccess }) => {
    const { user } = useAuthStore();
    const [recipient, setRecipient] = useState('');
    const [signature, setSignature] = useState(''); // Simulating signature data
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleVerify = async () => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            const token = `mock-jwt|${user.id}|${user.tenantId}|${user.email}`;
            await axios.post('http://localhost:3000/api/ops/sop/verify', {
                shipment_id: shipmentId,
                recipient,
                signature: 'base64_signature_data_demo',
                photos: [],
                lat: -6.200000,
                lng: 106.816666,
                notes: 'Delivered successfully via digital verification.'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess();
        } catch (error) {
            console.error('Failed to verify delivery:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-6">
            <div className="flex items-center space-x-3">
                <PackageCheck className="text-emerald-500" size={24} />
                <h2 className="text-lg font-black text-white uppercase tracking-tighter">Digital_POD</h2>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Recipient Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 pl-12 text-white font-bold outline-none focus:border-emerald-500 transition-colors"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Recipient Signature</label>
                    <div className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-xl relative border-dashed flex items-center justify-center group cursor-pointer hover:border-emerald-500/50 transition-all">
                        <PenTool className="text-zinc-700 group-hover:text-emerald-500 transition-colors" size={32} />
                        <span className="absolute bottom-3 text-[9px] font-black text-zinc-600 uppercase tracking-widest">Draw_Signature_Authorized</span>
                    </div>
                </div>

                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between group cursor-pointer hover:border-emerald-500/50 transition-all">
                    <div className="flex items-center space-x-3">
                        <Camera size={18} className="text-zinc-600 group-hover:text-emerald-500" />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Photo_Evidence_Required</span>
                    </div>
                    <CheckCircle size={16} className="text-zinc-800" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
                <Button variant="secondary" onClick={onCancel} className="py-4 rounded-xl font-black uppercase tracking-widest">Abort</Button>
                <Button
                    variant="primary"
                    className="py-4 rounded-xl font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleVerify}
                    disabled={isSubmitting || !recipient}
                >
                    {isSubmitting ? 'Verifying...' : 'Submit_POD'}
                </Button>
            </div>
        </div>
    );
};
