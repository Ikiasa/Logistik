'use client';

import React from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { AuditLog, UserRole } from './types';
import { Shield, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';

const roleColors: Record<UserRole, string> = {
    SUPERADMIN: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20',
    ADMIN: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    DISPATCHER: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    WAREHOUSE_OP: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    FINANCE_OP: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20',
    VIEWER: 'text-zinc-500 dark:text-zinc-500 bg-zinc-500/5 dark:bg-zinc-500/10 border-zinc-500/20',
};

const mockLogs: AuditLog[] = [
    {
        id: 'log-1',
        timestamp: new Date().toISOString(),
        userId: 'u-1',
        userName: 'Admin User',
        userRole: 'ADMIN',
        action: 'CREATE',
        entity: 'SHIPMENT',
        entityId: 'TRK-982341',
        metadata: { ip: '192.168.1.1' },
        ipAddress: '192.168.1.1',
        status: 'SUCCESS'
    },
    {
        id: 'log-2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        userId: 'u-2',
        userName: 'John Doe',
        userRole: 'FINANCE_OP',
        action: 'EXPORT',
        entity: 'INVOICE',
        metadata: { format: 'PDF' },
        ipAddress: '10.0.0.45',
        status: 'SUCCESS'
    },
    {
        id: 'log-3',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        userId: 'u-3',
        userName: 'Suspicious Bot',
        userRole: 'VIEWER',
        action: 'LOGIN',
        entity: 'SYSTEM',
        metadata: { error: 'Invalid password' },
        ipAddress: '185.22.33.44',
        status: 'FAILURE'
    }
];

export const AuditLogTable: React.FC = () => {
    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl w-fit">
                <ShieldCheck className="text-emerald-500" size={14} />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">RLS Active: Tenant Data Isolated</span>
            </div>

            <DataTable<AuditLog>
                title="System Audit Trail"
                data={mockLogs}
                columns={[
                    {
                        header: 'Timestamp',
                        accessor: (item) => (
                            <div className="flex flex-col">
                                <span className="text-zinc-900 dark:text-zinc-200 font-mono text-xs font-bold">{new Date(item.timestamp).toLocaleDateString()}</span>
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono uppercase font-black">{new Date(item.timestamp).toLocaleTimeString()}</span>
                            </div>
                        ),
                        className: 'w-40'
                    },
                    {
                        header: 'Agent',
                        accessor: (item) => (
                            <div className="flex items-center space-x-3">
                                <div className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-widest ${roleColors[item.userRole]}`}>
                                    {item.userRole}
                                </div>
                                <span className="text-sm font-black text-zinc-900 dark:text-zinc-300">{item.userName}</span>
                            </div>
                        ),
                        className: 'w-64'
                    },
                    {
                        header: 'Action',
                        accessor: (item) => (
                            <div className="flex items-center space-x-2">
                                <Badge variant={item.status === 'SUCCESS' ? 'success' : 'error'}>
                                    {item.action}
                                </Badge>
                                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{item.entity}</span>
                            </div>
                        )
                    },
                    {
                        header: 'IP Address',
                        accessor: (item) => (
                            <div className="flex items-center text-xs font-mono font-bold text-zinc-500 dark:text-zinc-500">
                                <Cpu size={12} className="mr-1.5 text-zinc-300 dark:text-zinc-700" />
                                {item.ipAddress}
                            </div>
                        )
                    }
                ]}
            />
        </div>
    );
};
