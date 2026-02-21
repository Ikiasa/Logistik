'use client';

import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'indigo';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20',
    error: 'bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20',
    info: 'bg-sky-500/10 text-sky-600 dark:text-sky-500 border-sky-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
    return (
        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-[0.15em] border ${variantStyles[variant]} ${className} shadow-sm backdrop-blur-sm`}>
            {children}
        </span>
    );
};
