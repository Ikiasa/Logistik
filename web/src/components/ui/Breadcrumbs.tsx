'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
    return (
        <nav className="flex items-center space-x-2 text-xs font-medium text-zinc-500 mb-6">
            <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">
                <Home size={14} />
            </Link>
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <ChevronRight size={14} className="text-zinc-700" />
                    {item.href ? (
                        <Link href={item.href} className="hover:text-zinc-300 transition-colors">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-zinc-300">{item.label}</span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};
