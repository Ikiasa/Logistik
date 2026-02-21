'use client';
import React from 'react';
import { MOCK_INVENTORY_BRAIN } from './wms.data';
import { AlertCircle, ShoppingCart, ArrowRight, Zap } from 'lucide-react';

export const ReorderAutomation: React.FC = () => {
    const lowStockItems = MOCK_INVENTORY_BRAIN.filter(item => item.status === 'LOW_STOCK' || item.status === 'OUT_OF_STOCK');

    return (
        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-rose-500/10 rounded-lg text-rose-600 dark:text-rose-500">
                        <AlertCircle size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">Reorder Intelligence</h3>
                </div>
                <button className="flex items-center space-x-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl text-[10px] font-black text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-all uppercase tracking-widest shadow-sm">
                    <span>Audit Config</span>
                </button>
            </div>

            <div className="space-y-4">
                {lowStockItems.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
                        <p className="text-sm text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-widest">All stock levels optimal</p>
                    </div>
                ) : (
                    lowStockItems.map(item => (
                        <div key={item.id} className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/50 rounded-2xl hover:border-rose-500/30 transition-all group shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 font-mono tracking-tighter uppercase">{item.sku}</span>
                                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{item.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-black text-rose-600 dark:text-rose-400">{item.quantity} {item.unit} left</span>
                                    <p className="text-[8px] text-zinc-400 dark:text-zinc-700 font-bold uppercase tracking-widest">Safety: {item.reorderPoint}</p>
                                </div>
                            </div>

                            <button className="w-full py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center space-x-2 text-[10px] font-black text-zinc-500 dark:text-zinc-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all uppercase tracking-widest shadow-sm">
                                <ShoppingCart size={12} />
                                <span>Generate Purchase Order</span>
                                <ArrowRight size={12} className="ml-1" />
                            </button>
                        </div>
                    ))
                )}

                <div className="p-4 bg-indigo-500/5 dark:bg-indigo-600/10 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl">
                    <div className="flex items-start space-x-3">
                        <Zap size={16} className="text-indigo-600 dark:text-indigo-400 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-zinc-900 dark:text-white mb-1">AI Prediction</p>
                            <p className="text-[10px] text-zinc-500 dark:text-indigo-200/60 leading-relaxed font-medium">
                                Demand for <span className="text-zinc-900 dark:text-white font-bold">Heavy Duty Pallets</span> is expected to rise by 25% next week based on current shipment trends.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
