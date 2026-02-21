'use client';

import React from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { TenantUser, UserRole } from './types';
import { MoreHorizontal, UserCog, UserMinus, Shield } from 'lucide-react';

const mockUsers: TenantUser[] = [
    { id: 'u-1', name: 'Admin User', email: 'admin@logistik.com', role: 'ADMIN', lastLogin: '2026-02-15 10:30 AM', status: 'ACTIVE' },
    { id: 'u-2', name: 'John Doe', email: 'john@logistik.com', role: 'DISPATCHER', lastLogin: '2026-02-15 09:12 AM', status: 'ACTIVE' },
    { id: 'u-3', name: 'Jane Smith', email: 'jane@logistik.com', role: 'FINANCE_OP', lastLogin: '2026-02-14 04:45 PM', status: 'ACTIVE' },
    { id: 'u-4', name: 'Restricted User', email: 'rest@logistik.com', role: 'VIEWER', lastLogin: '2026-02-10 11:20 AM', status: 'INACTIVE' },
];

export const UserManagement: React.FC = () => {
    return (
        <DataTable<TenantUser>
            title="Tenant User Directory"
            data={mockUsers}
            columns={[
                {
                    header: 'User identity',
                    accessor: (item) => (
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase">
                                {item.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-black text-zinc-900 dark:text-white truncate">{item.name}</span>
                                <span className="text-[10px] text-zinc-500 font-bold truncate">{item.email}</span>
                            </div>
                        </div>
                    ),
                    className: 'w-72'
                },
                {
                    header: 'Security Role',
                    accessor: (item) => (
                        <div className="flex items-center space-x-2">
                            <Shield size={14} className="text-indigo-600 dark:text-indigo-500" />
                            <span className="text-[10px] font-black text-zinc-900 dark:text-zinc-300 uppercase tracking-widest">{item.role}</span>
                        </div>
                    )
                },
                {
                    header: 'Last Session',
                    accessor: (item) => (
                        <span className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-500">{item.lastLogin || 'Never'}</span>
                    )
                },
                {
                    header: 'Status',
                    accessor: (item) => (
                        <Badge variant={item.status === 'ACTIVE' ? 'success' : 'default'}>
                            {item.status}
                        </Badge>
                    )
                },
                {
                    header: '',
                    accessor: () => (
                        <div className="flex items-center justify-end space-x-3">
                            <button className="text-zinc-300 dark:text-zinc-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                <UserCog size={16} />
                            </button>
                            <button className="text-zinc-300 dark:text-zinc-700 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                <UserMinus size={16} />
                            </button>
                        </div>
                    ),
                    className: 'w-20 text-right'
                }
            ]}
        />
    );
};
