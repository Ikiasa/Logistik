'use client';

import React, { useState } from 'react';
import { Wallet, Percent, Save, Plus, Trash2 } from 'lucide-react';
import { RateMatrix, RateTier } from './types';
import { Button } from '@/components/ui/Button';
import { formatIDR } from '@/lib/utils/format';

export const RateMatrixEditor: React.FC = () => {
    const [tiers, setTiers] = useState<RateTier[]>([
        { id: '1', minWeightKg: 0, maxWeightKg: 50, ratePerKgCents: 1500000, baseFeeCents: 5000000 },
        { id: '2', minWeightKg: 51, maxWeightKg: 500, ratePerKgCents: 1200000, baseFeeCents: 10000000 },
        { id: '3', minWeightKg: 501, maxWeightKg: 2000, ratePerKgCents: 1000000, baseFeeCents: 25000000 },
    ]);

    const addTier = () => {
        const lastTier = tiers[tiers.length - 1];
        setTiers([...tiers, {
            id: Math.random().toString(36).substr(2, 9),
            minWeightKg: lastTier ? lastTier.maxWeightKg + 1 : 0,
            maxWeightKg: lastTier ? lastTier.maxWeightKg + 500 : 500,
            ratePerKgCents: 1000000,
            baseFeeCents: 5000000
        }]);
    };

    const removeTier = (id: string) => {
        setTiers(tiers.filter(t => t.id !== id));
    };

    const updateTier = (id: string, field: keyof RateTier, value: number) => {
        setTiers(tiers.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
                <div>
                    <h3 className="text-xs font-black text-zinc-900 dark:text-white flex items-center uppercase tracking-widest">
                        <Wallet className="mr-2 text-emerald-600 dark:text-emerald-500" size={16} /> Standard_Rate_Matrix
                    </h3>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-bold mt-1">Define variable pricing based on weight tiers.</p>
                </div>
                <Button variant="secondary" className="h-9 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl border-zinc-200 dark:border-zinc-800">
                    <Save size={14} className="mr-2" /> Save_Changes
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800">
                            <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em]">Weight Range (KG)</th>
                            <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em]">Base Fee</th>
                            <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em]">Rate / KG</th>
                            <th className="px-6 py-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                        {tiers.map((tier) => (
                            <tr key={tier.id} className="hover:bg-zinc-800/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-2">
                                        <input type="number" className="w-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-xs font-bold text-zinc-900 dark:text-white outline-none focus:border-emerald-500/50 transition-colors" value={tier.minWeightKg} onChange={(e) => updateTier(tier.id, 'minWeightKg', Number(e.target.value))} />
                                        <span className="text-zinc-300 dark:text-zinc-700 font-black">-</span>
                                        <input type="number" className="w-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-xs font-bold text-zinc-900 dark:text-white outline-none focus:border-emerald-500/50 transition-colors" value={tier.maxWeightKg} onChange={(e) => updateTier(tier.id, 'maxWeightKg', Number(e.target.value))} />
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono font-black text-zinc-900 dark:text-white text-xs">
                                    {formatIDR(tier.baseFeeCents)}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-1 font-mono font-bold text-emerald-500">
                                        {formatIDR(tier.ratePerKgCents)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => removeTier(tier.id)} className="text-zinc-700 hover:text-red-500 transition-colors p-1">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button
                onClick={addTier}
                className="w-full py-4 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800 text-[10px] font-black text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 uppercase tracking-[0.2em] transition-all flex items-center justify-center"
            >
                <Plus size={14} className="mr-2" /> Add_New_Weight_Tier
            </button>
        </div>
    );
};
