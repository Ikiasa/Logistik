'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden">
            <aside className="flex-shrink-0 isolate">
                <Sidebar />
            </aside>
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-zinc-50 to-zinc-50 dark:from-zinc-900/50 dark:via-zinc-950 dark:to-zinc-950">
                    <div className="w-full grid grid-cols-1 gap-8">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    );
};
