
'use client';

import React, { useEffect, useState } from 'react';
import { Order } from '@/types/order';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/currency';
import { Skeleton } from '@/components/ui/Skeleton';

export const OrderList: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get('/orders');
            setOrders(res.data);
        } catch (err) {
            console.error('Failed to fetch orders', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
        );
    }

    return (
        <div className="overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-[2rem] bg-white dark:bg-zinc-950 shadow-sm">
            <table className="min-w-full divide-y divide-zinc-100 dark:divide-zinc-800">
                <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 uppercase tracking-widest font-black text-[10px]">
                    <tr>
                        <th className="px-6 py-4 text-left text-zinc-400 dark:text-zinc-600">Order_ID</th>
                        <th className="px-6 py-4 text-left text-zinc-400 dark:text-zinc-600">Amount</th>
                        <th className="px-6 py-4 text-left text-zinc-400 dark:text-zinc-600">Status</th>
                        <th className="px-6 py-4 text-left text-zinc-400 dark:text-zinc-600">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                    {orders.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">No orders found.</td>
                        </tr>
                    ) : (
                        orders.map((order) => (
                            <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap text-xs font-black font-mono text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                    {order.id.slice(0, 8)}_RAW
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-white font-black font-mono">
                                    {formatCurrency(order.total_amount, order.total_currency)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${order.status === 'COMPLETED' ? 'bg-indigo-500/10 text-indigo-400' :
                                        'bg-zinc-800 text-zinc-400'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-[10px] font-black font-mono text-zinc-400 dark:text-zinc-500 uppercase">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};
