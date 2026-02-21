'use client';
import React from 'react';
import { InboundShipment } from './types';
import { MOCK_INBOUND_SHIPMENTS } from './wms.data';
import { Ship, Clock, CheckCircle2, AlertCircle, ArrowRight, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

const statusConfig: Record<string, { icon: React.ElementType, color: string, label: string }> = {
    ASN: { icon: Clock, color: 'text-zinc-400 dark:text-zinc-500', label: 'ASN Prepared' },
    PENDING: { icon: Truck, color: 'text-amber-500 dark:text-amber-400', label: 'In Transit' },
    RECEIVING: { icon: Clock, color: 'text-indigo-600 dark:text-indigo-400', label: 'Receiving' },
    QC: { icon: AlertCircle, color: 'text-rose-600 dark:text-rose-400', label: 'Quality Control' },
    COMPLETED: { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', label: 'Stored' },
};

function Activity({ size, className }: { size?: number, className?: string }) {
    return <Clock size={size} className={className} />;
}

export const InboundWorkflow: React.FC = () => {
    return (
        <div className="bg-white dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Inbound Queue</h3>
                    <div className="flex items-center space-x-2 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>4 Active Shipments</span>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {MOCK_INBOUND_SHIPMENTS.map((shipment) => {
                    const cfg = statusConfig[shipment.status];
                    const StatusIcon = cfg.icon;

                    return (
                        <div key={shipment.id} className="p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex items-start space-x-4">
                                    <div className={`p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 ${cfg.color}`}>
                                        <StatusIcon size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-3 mb-1">
                                            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] font-mono">{shipment.reference}</span>
                                            <Badge variant={shipment.status === 'QC' ? 'error' : 'indigo'}>
                                                {cfg.label}
                                            </Badge>
                                        </div>
                                        <h4 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{shipment.origin}</h4>
                                        <p className="text-xs text-zinc-400 dark:text-zinc-600 font-medium">Expected: {new Date(shipment.expectedDate).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-8">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1">Items</span>
                                        <div className="flex -space-x-2">
                                            {shipment.items.map(item => (
                                                <div key={item.sku} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-950 flex items-center justify-center text-[8px] font-black text-zinc-400 dark:text-zinc-500 shadow-sm">
                                                    {item.sku.split('-').pop()}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <button className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm">
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center space-x-2">
                                <div className="flex-1 h-1 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-indigo-500 transition-all duration-1000`}
                                        style={{ width: shipment.status === 'ASN' ? '20%' : shipment.status === 'QC' ? '80%' : '100%' }}
                                    />
                                </div>
                                <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-700 uppercase tracking-widest">
                                    {shipment.status === 'ASN' ? 'Pre-Alert' : shipment.status === 'QC' ? 'Validation' : 'Finalizing'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
