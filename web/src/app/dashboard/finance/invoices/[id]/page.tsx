'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Printer, Download, CreditCard, Mail, Building2, User } from 'lucide-react';

export default function InvoiceDetailPage() {
    const params = useParams();
    const id = params.id as string;

    return (
        <DashboardLayout>
            <Breadcrumbs items={[
                { label: 'Finance', href: '/dashboard/finance' },
                { label: `Invoice #${id.slice(0, 8)}` }
            ]} />

            <div className="flex items-center justify-between mb-8 pb-8 border-b border-zinc-900">
                <div>
                    <div className="flex items-center space-x-3">
                        <h1 className="text-3xl font-black text-white tracking-tighter">INV-2026-002</h1>
                        <Badge variant="indigo">ISSUED</Badge>
                    </div>
                    <p className="text-zinc-500 mt-1 uppercase text-[10px] font-bold tracking-widest">Digital Audit Reference: {id}</p>
                </div>
                <div className="flex space-x-3">
                    <Button variant="secondary"><Printer size={18} className="mr-2" /> Print</Button>
                    <Button variant="secondary"><Download size={18} className="mr-2" /> PDF</Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 border-none"><CreditCard size={18} className="mr-2" /> Record Payment</Button>
                </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -mr-32 -mt-32 rounded-full"></div>

                <div className="grid grid-cols-2 gap-20 relative z-10">
                    {/* Company Info */}
                    <div>
                        <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center font-bold text-2xl text-white mb-6">L</div>
                        <h2 className="text-xl font-bold text-white mb-2">Logistik ERP Solutions</h2>
                        <div className="text-sm text-zinc-500 space-y-1">
                            <p>Premium Enterprise Tower</p>
                            <p>Sudirman Central District, Jakarta</p>
                            <p>finance@logistik.com</p>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="text-right">
                        <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Bill To</h3>
                        <h2 className="text-xl font-bold text-white mb-2">Industries B, Inc.</h2>
                        <div className="text-sm text-zinc-500 space-y-1 font-medium">
                            <p>Operations Department</p>
                            <p>Banjarmasin, South Kalimantan</p>
                            <p>contact@industries-b.com</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-8 my-16 py-8 border-y border-zinc-900">
                    <div>
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Issue Date</p>
                        <p className="text-sm font-bold text-white font-mono">2026-02-10</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Due Date</p>
                        <p className="text-sm font-bold text-white font-mono">2026-02-24</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Method</p>
                        <p className="text-sm font-bold text-zinc-400">Bank Transfer</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Total Amount</p>
                        <p className="text-2xl font-black text-emerald-500 font-mono tracking-tighter">$4,950.00</p>
                    </div>
                </div>

                {/* Line Items */}
                <div className="space-y-6">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left">
                                <th className="pb-4 text-[10px] font-black text-zinc-700 uppercase tracking-widest">Description</th>
                                <th className="pb-4 text-[10px] font-black text-zinc-700 uppercase tracking-widest w-24 text-right">Qty</th>
                                <th className="pb-4 text-[10px] font-black text-zinc-700 uppercase tracking-widest w-32 text-right">Unit Price</th>
                                <th className="pb-4 text-[10px] font-black text-zinc-700 uppercase tracking-widest w-32 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                            {[
                                { desc: 'Premium Shipment Fulfillment (Jakarta → Medan)', qty: 4, price: 110000, total: 440000 },
                                { desc: 'Rush Delivery Surcharge', qty: 1, price: 10000, total: 10000 },
                            ].map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-6 text-sm font-bold text-zinc-300">{item.desc}</td>
                                    <td className="py-6 text-sm font-mono text-zinc-500 text-right">{item.qty}</td>
                                    <td className="py-6 text-sm font-mono text-zinc-500 text-right">${(item.price / 100).toFixed(2)}</td>
                                    <td className="py-6 text-sm font-mono font-bold text-white text-right">${(item.total / 100).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-16 flex justify-end">
                    <div className="w-80 space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-600 font-medium">Subtotal</span>
                            <span className="text-zinc-300 font-mono">$4,500.00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-600 font-medium">VAT (10%)</span>
                            <span className="text-zinc-300 font-mono">$450.00</span>
                        </div>
                        <div className="pt-4 border-t border-zinc-900 flex justify-between items-center">
                            <span className="text-lg font-black text-white">Total</span>
                            <span className="text-3xl font-black text-emerald-500 font-mono tracking-tighter">$4,950.00</span>
                        </div>
                    </div>
                </div>

                <div className="mt-20 pt-10 border-t border-dashed border-zinc-900 text-center">
                    <p className="text-xs text-zinc-600 font-medium">
                        Payment is expected within 14 days of the issue date. Thank you for your business.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
