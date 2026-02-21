'use client';

import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar, Cell, Legend
} from 'recharts';

const data = [
    { month: 'Sep', revenue: 4000, gross: 2400, net: 1800 },
    { month: 'Oct', revenue: 3000, gross: 1398, net: 900 },
    { month: 'Nov', revenue: 2000, gross: 9800, net: 7000 },
    { month: 'Dec', revenue: 2780, gross: 3908, net: 2500 },
    { month: 'Jan', revenue: 1890, gross: 4800, net: 3800 },
    { month: 'Feb', revenue: 2390, gross: 3800, net: 3100 },
];

const costData = [
    { name: 'Fuel', value: 45, color: '#10b981' },
    { name: 'Toll', value: 15, color: '#f59e0b' },
    { name: 'Driver OT', value: 20, color: '#6366f1' },
    { name: 'Idle Cost', value: 10, color: '#ef4444' },
    { name: 'Maint.', value: 10, color: '#71717a' },
];

export const MarginTrendChart: React.FC = () => {
    return (
        <div className="h-[300px] w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] mb-6">Margin_Trend_Analysis</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis
                        dataKey="month"
                        stroke="#666"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#666"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--tooltip-bg, #fff)',
                            border: '1px solid var(--tooltip-border, #f4f4f5)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                        }}
                        itemStyle={{ color: 'var(--tooltip-text, #18181b)', fontSize: '10px', fontWeight: 'bold' }}
                        labelStyle={{ color: 'var(--tooltip-text, #18181b)', fontWeight: 'black' }}
                        wrapperClassName="dark:[--tooltip-bg:#09090b] dark:[--tooltip-border:#27272a] dark:[--tooltip-text:#fff]"
                    />
                    <Area
                        type="monotone"
                        dataKey="gross"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorGross)"
                        name="Gross Margin %"
                    />
                    <Area
                        type="monotone"
                        dataKey="net"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorNet)"
                        name="Net Margin %"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export const CostBreakdownChart: React.FC = () => {
    return (
        <div className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] mb-4">Cost_Distribution</h3>
            <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={costData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            stroke="#888"
                            fontSize={11}
                            width={55}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'currentColor', className: 'text-zinc-100 dark:text-zinc-800', opacity: 0.1 } as any}
                            contentStyle={{
                                backgroundColor: 'var(--tooltip-bg, #fff)',
                                border: '1px solid var(--tooltip-border, #f4f4f5)',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                            }}
                            itemStyle={{ color: 'var(--tooltip-text, #18181b)', fontSize: '10px', fontWeight: 'bold' }}
                            labelStyle={{ color: 'var(--tooltip-text, #18181b)', fontWeight: 'black' }}
                            wrapperClassName="dark:[--tooltip-bg:#09090b] dark:[--tooltip-border:#27272a] dark:[--tooltip-text:#fff]"
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                            {costData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
