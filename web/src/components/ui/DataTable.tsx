'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Download, Filter, Search } from 'lucide-react';

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    title?: string;
    isLoading?: boolean;
}

export function DataTable<T>({ data, columns, title, isLoading }: DataTableProps<T>) {
    const [pageSize] = useState(10);
    const [currentPage] = useState(1);

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-8 bg-zinc-100 dark:bg-zinc-900 rounded w-1/4"></div>
                <div className="h-64 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                {title && <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h3>}
                <div className="flex items-center space-x-2">
                    <button className="flex items-center text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                        <Filter size={14} className="mr-2" /> Filter
                    </button>
                    <button className="flex items-center text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                        <Download size={14} className="mr-2" /> Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                        <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                            <tr>
                                {columns.map((col, idx) => (
                                    <th
                                        key={idx}
                                        className={`px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest ${col.className}`}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-12 text-center text-zinc-400 dark:text-zinc-500 text-sm italic">
                                        No data available in this view.
                                    </td>
                                </tr>
                            ) : (
                                data.map((item, rowIdx) => (
                                    <tr key={rowIdx} className="hover:bg-indigo-500/5 dark:hover:bg-indigo-500/5 ring-inset hover:ring-1 hover:ring-indigo-500/20 transition-all cursor-pointer">
                                        {columns.map((col, colIdx) => (
                                            <td key={colIdx} className={`px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300 ${col.className}`}>
                                                {typeof col.accessor === 'function'
                                                    ? col.accessor(item)
                                                    : (item[col.accessor] as React.ReactNode)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/30 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <p className="text-xs text-zinc-500">
                        Showing <span className="text-zinc-900 dark:text-zinc-300 font-medium font-mono">1</span> to{' '}
                        <span className="text-zinc-900 dark:text-zinc-300 font-medium font-mono">{Math.min(data.length, pageSize)}</span> of{' '}
                        <span className="text-zinc-900 dark:text-zinc-300 font-medium font-mono">{data.length}</span> results
                    </p>
                    <div className="flex space-x-1">
                        <button className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 disabled:opacity-30" disabled>
                            <ChevronLeft size={16} />
                        </button>
                        <button className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 disabled:opacity-30" disabled>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
