'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownLeft, RefreshCcw, User } from 'lucide-react';
import { StockMovement } from './types';

const mockMovements: StockMovement[] = [
    {
        id: 'mov-1',
        itemId: 'inv-1',
        itemName: 'Heavy Duty Pallet',
        type: 'INBOUND',
        quantity: 50,
        timestamp: new Date().toISOString(),
        performedBy: 'John Warehouse',
        referenceId: 'PO-88231'
    },
    {
        id: 'mov-2',
        itemId: 'inv-2',
        itemName: 'Wrapping Film 50cm',
        type: 'OUTBOUND',
        quantity: 2,
        timestamp: new Date().toISOString(),
        performedBy: 'Mike Logistics',
        referenceId: 'SH-99021'
    }
];

export const StockMovementList: React.FC = () => {
    return (
        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 h-full shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Recent Movements</h3>
                <button className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                    View All Activity
                </button>
            </div>

            <div className="space-y-4">
                {mockMovements.map((mov) => (
                    <div key={mov.id} className="flex items-start space-x-4 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors group border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700/50">
                        <div className={`p-2 rounded-lg ${mov.type === 'INBOUND' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' :
                            mov.type === 'OUTBOUND' ? 'bg-red-500/10 text-red-600 dark:text-red-500' :
                                'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                            }`}>
                            {mov.type === 'INBOUND' ? <ArrowUpRight size={16} /> :
                                mov.type === 'OUTBOUND' ? <ArrowDownLeft size={16} /> :
                                    <RefreshCcw size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-200 truncate">{mov.itemName}</p>
                                <p className={`text-sm font-black ${mov.type === 'INBOUND' ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'
                                    }`}>
                                    {mov.type === 'INBOUND' ? '+' : '-'}{mov.quantity}
                                </p>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                                    <User size={10} className="mr-1" />
                                    {mov.performedBy}
                                    <span className="mx-2 text-zinc-200 dark:text-zinc-800">•</span>
                                    {mov.referenceId && <span className="text-zinc-400 dark:text-zinc-600 font-mono uppercase font-bold">{mov.referenceId}</span>}
                                </div>
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-700 font-mono">
                                    {new Date(mov.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
