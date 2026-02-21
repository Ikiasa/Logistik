'use client';

import React from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const Navbar: React.FC = () => {
    const { user } = useAuthStore();

    return (
        <header className="h-16 w-full bg-white/80 dark:bg-zinc-950/50 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 grid grid-cols-[1fr_auto] items-center px-8 sticky top-0 z-10">
            <div className="flex items-center w-full">
                <div className="relative w-full max-w-2xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search shipments, orders, or vehicles..."
                        className="w-full bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-6 justify-self-end">
                <div className="hidden md:flex items-center px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">
                        {user?.tenantId?.slice(0, 8) || 'GLOBAL'}
                    </span>
                </div>

                <div className="flex items-center space-x-3 text-zinc-500 dark:text-zinc-400">
                    <ThemeToggle />
                    <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white dark:border-zinc-950"></span>
                    </button>
                    <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors">
                        <HelpCircle size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};
