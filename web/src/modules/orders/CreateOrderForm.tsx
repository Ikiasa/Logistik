
'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { parseAmountInput } from '@/lib/currency';
import { Button } from '@/components/ui/Button';
import { Toast, ToastType } from '@/components/ui/Toast';

interface CreateOrderFormProps {
    onSuccess: () => void;
}

export const CreateOrderForm: React.FC<CreateOrderFormProps> = ({ onSuccess }) => {
    const [amountStr, setAmountStr] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amountCents = parseAmountInput(amountStr);

        if (amountCents <= 0) {
            setToast({ message: 'Invalid amount.', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            await api.post('/orders', {
                total_amount: amountCents,
                total_currency: currency
            });
            setToast({ message: 'Order created successfully!', type: 'success' });
            setAmountStr('');
            onSuccess();
        } catch (err: any) {
            // 409 is handled globally but we can add UI specifics here if needed
            setToast({ message: err.response?.data?.message || 'Failed to create order', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2rem] shadow-sm">
            <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-6 uppercase tracking-tight">New_Order</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-2 px-1">Amount</label>
                    <input
                        type="number"
                        step="0.01"
                        value={amountStr}
                        onChange={(e) => setAmountStr(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-zinc-900 dark:text-white font-black text-lg focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder-zinc-300 dark:placeholder-zinc-800"
                        required
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-2 px-1">Currency</label>
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-zinc-900 dark:text-white font-black focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none"
                    >
                        <option value="USD">USD - United States Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="IDR">IDR - Indonesian Rupiah</option>
                    </select>
                </div>

                <Button type="submit" isLoading={loading} className="w-full py-8 text-lg font-black uppercase tracking-[0.2em] bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 rounded-2xl group transition-all">
                    Submit_Order
                </Button>
            </form>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};
