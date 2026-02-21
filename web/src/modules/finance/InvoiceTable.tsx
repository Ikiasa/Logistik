'use client';

import React from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Invoice, InvoiceStatus } from './types';
import { FileText, ExternalLink, Download } from 'lucide-react';
import Link from 'next/link';

import { formatIDR } from '@/lib/utils/format';

const statusVariants: Record<InvoiceStatus, any> = {
    DRAFT: 'default',
    ISSUED: 'indigo',
    PAID: 'success',
    OVERDUE: 'error',
    CANCELLED: 'error',
};

const mockInvoices: Invoice[] = [
    {
        id: 'inv-1001',
        invoiceNumber: 'INV-2026-001',
        customerId: 'c-1',
        customerName: 'Global Corp A',
        status: 'PAID',
        issueDate: '2026-02-01',
        dueDate: '2026-02-15',
        subtotalCents: 125000000,
        taxCents: 12500000,
        totalCents: 137500000,
        items: [],
        tenantId: 't-1'
    },
    {
        id: 'inv-1002',
        invoiceNumber: 'INV-2026-002',
        customerId: 'c-2',
        customerName: 'Industries B',
        status: 'ISSUED',
        issueDate: '2026-02-10',
        dueDate: '2026-02-24',
        subtotalCents: 450000000,
        taxCents: 45000000,
        totalCents: 495000000,
        items: [],
        tenantId: 't-1'
    },
    {
        id: 'inv-1003',
        invoiceNumber: 'INV-2026-003',
        customerId: 'c-3',
        customerName: 'Tech Services C',
        status: 'OVERDUE',
        issueDate: '2026-01-15',
        dueDate: '2026-01-29',
        subtotalCents: 89000000,
        taxCents: 8900000,
        totalCents: 97900000,
        items: [],
        tenantId: 't-1'
    }
];

export const InvoiceTable: React.FC = () => {
    return (
        <DataTable<Invoice>
            title="Accounts Receivable"
            data={mockInvoices}
            columns={[
                {
                    header: 'Invoice #',
                    accessor: (item) => (
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-lg group-hover:bg-indigo-500/10 group-hover:border-indigo-500/50 transition-colors">
                                <FileText className="text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" size={16} />
                            </div>
                            <span className="font-bold text-zinc-900 dark:text-zinc-200 font-mono text-xs">{item.invoiceNumber}</span>
                        </div>
                    ),
                    className: 'w-48'
                },
                {
                    header: 'Customer',
                    accessor: 'customerName',
                    className: 'text-zinc-400 font-medium'
                },
                {
                    header: 'Status',
                    accessor: (item) => (
                        <Badge variant={statusVariants[item.status]}>
                            {item.status}
                        </Badge>
                    )
                },
                {
                    header: 'Amount Due',
                    accessor: (item) => (
                        <div className="font-mono text-right font-black text-zinc-900 dark:text-white">
                            {formatIDR(item.totalCents)}
                        </div>
                    ),
                    className: 'text-right'
                },
                {
                    header: 'Due Date',
                    accessor: (item) => (
                        <div className="flex flex-col text-right">
                            <span className={`text-xs font-bold ${item.status === 'OVERDUE' ? 'text-red-500' : 'text-zinc-400'
                                }`}>{item.dueDate}</span>
                        </div>
                    ),
                    className: 'text-right'
                },
                {
                    header: '',
                    accessor: (item) => (
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => window.open(`/api/finance/invoices/${item.id}/pdf`, '_blank')}
                                className="p-1.5 text-zinc-500 hover:text-emerald-400 transition-colors"
                                title="Download PDF"
                            >
                                <Download size={16} />
                            </button>
                            <Link href={`/dashboard/finance/invoices/${item.id}`} className="p-1.5 text-zinc-500 hover:text-white transition-colors">
                                <ExternalLink size={16} />
                            </Link>
                        </div>
                    ),
                    className: 'w-20'
                }
            ]}
        />
    );
};
