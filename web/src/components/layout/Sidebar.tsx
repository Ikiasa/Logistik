import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    Warehouse,
    Truck,
    Users,
    CreditCard,
    Settings,
    ChevronLeft,
    Menu,
    Map,
    Shield,
    Activity,
    Box,
    Sun,
    Moon
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePermission, Role } from '@/hooks/usePermission';
import { useAuthStore } from '@/store/authStore';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Fleet Command', href: '/dashboard/fleet/live', icon: Map, roles: [Role.DISPATCHER, Role.SUPER_ADMIN, Role.AUDITOR] },
    { name: 'Operational Node', href: '/dashboard/fleet/ops', icon: Shield, roles: [Role.DISPATCHER, Role.SUPER_ADMIN] },
    { name: 'Fleet Intel', href: '/dashboard/fleet/intelligence', icon: Activity, roles: [Role.DISPATCHER, Role.SUPER_ADMIN, Role.AUDITOR] },
    { name: 'Warehouse', href: '/dashboard/warehouse', icon: Box, roles: [Role.DISPATCHER, Role.SUPER_ADMIN] },
    { name: 'Fleet', href: '/dashboard/fleet', icon: Truck, roles: [Role.DISPATCHER, Role.SUPER_ADMIN] },
    { name: 'Drivers', href: '/dashboard/drivers', icon: Users, roles: [Role.DISPATCHER, Role.SUPER_ADMIN] },
    { name: 'Finance', href: '/dashboard/finance', icon: CreditCard, roles: [Role.FINANCE, Role.SUPER_ADMIN, Role.AUDITOR] },
    { name: 'Admin', href: '/dashboard/admin', icon: Settings, roles: [Role.SUPER_ADMIN] },
];

export const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { hasRole } = usePermission();
    const { user, token } = useAuthStore();

    useEffect(() => {
        setMounted(true);
    }, []);

    // IMPORTANT: Gate isLoggedIn behind mounted to avoid hydration mismatch.
    // On SSR, js-cookie can't read browser cookies → token is null → isLoggedIn false.
    // On client pre-hydration, we also treat as false to match SSR output.
    // After mount, the real token value is used and items update correctly.
    const isLoggedIn = mounted && !!token;
    const validRoleSet = ['SUPER_ADMIN', 'FINANCE', 'DISPATCHER', 'DRIVER', 'AUDITOR'];
    const hasValidRoles = mounted && (user?.roles?.some(r => validRoleSet.includes(r)) ?? false);

    const filteredNavItems = navItems.filter(item => {
        if (!item.roles) return true;           // No restriction → always show
        if (!isLoggedIn) return false;          // Not mounted yet or not logged in → hide
        if (!hasValidRoles) return true;        // Logged in + stale roles → show all
        return hasRole(item.roles as Role[]);   // Normal RBAC check
    });

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <aside
            className={`flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 relative z-[9999] pointer-events-auto ${collapsed ? 'w-20' : 'w-64'}`}
        >
            <div className="flex items-center justify-between h-16 px-6 border-b border-zinc-200 dark:border-zinc-800">
                {!collapsed && (
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                        LOGISTIK
                    </span>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400"
                >
                    {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
                {filteredNavItems.map((item) => {
                    const bestMatch = [...filteredNavItems]
                        .sort((a, b) => b.href.length - a.href.length)
                        .find(ni => pathname === ni.href || (ni.href !== '/dashboard' && pathname?.startsWith(ni.href + '/')));

                    const isActive = item.href === bestMatch?.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center px-3 py-2.5 rounded-lg transition-colors duration-150 ${isActive
                                ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-white'
                                : 'text-zinc-500 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-300'
                                }`}
                        >
                            <item.icon
                                size={20}
                                className={`${isActive
                                    ? 'text-indigo-600 dark:text-white'
                                    : 'text-zinc-400 dark:text-zinc-500'}`}
                            />
                            {!collapsed && (
                                <span className="ml-3 text-sm font-medium">
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                {mounted && (
                    <button
                        onClick={toggleTheme}
                        className={`flex items-center w-full px-2 py-2 rounded-lg transition-colors ${collapsed ? 'justify-center' : 'justify-start'
                            } text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-300`}
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark' ? (
                            <Sun size={20} className="text-amber-500" />
                        ) : (
                            <Moon size={20} className="text-indigo-600 dark:text-indigo-400" />
                        )}
                        {!collapsed && (
                            <span className="ml-3 text-sm font-medium">
                                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                            </span>
                        )}
                    </button>
                )}
                <div className={`flex items-center ${collapsed ? 'justify-center' : 'px-2'}`}>
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    {!collapsed && (
                        <div className="ml-3">
                            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate max-w-[120px]">
                                {user?.email?.split('@')[0] || 'User'}
                            </p>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">
                                {user?.roles?.[0] || 'GUEST'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};
