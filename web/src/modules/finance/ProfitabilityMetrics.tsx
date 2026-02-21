'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign, PieChart, TrendingUp, AlertCircle, Fuel, Wrench, CreditCard, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

export const ProfitabilityMetrics: React.FC<{ vehicleId: string }> = ({ vehicleId }) => {
    const { user } = useAuthStore();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfitability = async () => {
            if (!user) return;
            try {
                const token = `mock-jwt|${user.id}|${user.tenantId}|${user.email}`;
                const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
                const end = new Date().toISOString();
                const response = await axios.get(`http://localhost:3000/api/finance/costs/profitability?vehicle_id=${vehicleId}&start=${start}&end=${end}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(response.data);
            } catch (error) {
                console.error('Failed to fetch profitability metrics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfitability();
    }, [user, vehicleId]);

    if (loading) return <div className="p-8 text-center text-zinc-600 font-mono text-[10px] tracking-widest">INTERROGATING_FINANCIAL_NODE...</div>;
    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-2">Net_Monthly_Margin</p>
                    <p className={`text-2xl font-black tracking-tighter ${data.netMargin >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
                        ${data.netMargin.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-black uppercase mt-2">{data.marginPercentage.toFixed(1)}% yield rate</p>
                </div>
                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-2">Total_Operational_Cost</p>
                    <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">
                        ${data.totalCosts.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-black uppercase mt-2">Aggregated Expenses</p>
                </div>
            </div>

            <div className="space-y-3">
                <h4 className="text-[10px] font-black text-zinc-700 uppercase tracking-widest px-1">Cost_Breakdown</h4>
                <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-inner">
                        <div className="flex items-center space-x-3">
                            <Fuel size={16} className="text-amber-500" />
                            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Fuel_Expenditure</span>
                        </div>
                        <span className="text-xs font-mono font-black text-zinc-900 dark:text-white">${data.fuelCosts.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-inner">
                        <div className="flex items-center space-x-3">
                            <Wrench size={16} className="text-indigo-600 dark:text-indigo-400" />
                            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Maintenance_&_Repair</span>
                        </div>
                        <span className="text-xs font-mono font-black text-zinc-900 dark:text-white">${data.maintenanceCosts.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-inner">
                        <div className="flex items-center space-x-3">
                            <CreditCard size={16} className="text-emerald-600 dark:text-emerald-500" />
                            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Tolls_&_Access_Fees</span>
                        </div>
                        <span className="text-xs font-mono font-black text-zinc-900 dark:text-white">${data.opExpenses.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                <div className="flex items-center space-x-3 mb-4">
                    <PieChart size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Efficiency_Alert</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold leading-relaxed">
                    Vehicle is currently operating at <span className="text-zinc-900 dark:text-white font-black">{data.marginPercentage.toFixed(1)}%</span> margin. Fuel costs represent <span className="text-zinc-900 dark:text-white font-black">{((data.fuelCosts / (data.totalCosts || 1)) * 100).toFixed(0)}%</span> of total overhead.
                </p>
                <Button variant="secondary" className="w-full mt-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest">Optimize_Route_Cost</Button>
            </div>
        </div>
    );
};
