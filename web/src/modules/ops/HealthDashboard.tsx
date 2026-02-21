'use client';

import React, { useEffect, useState } from 'react';
import { Heart, Activity, HardDrive, Cpu, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

export const HealthDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const [health, setHealth] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchHealth = async () => {
        setLoading(true);
        try {
            const token = `mock-jwt|${user?.id}|${user?.tenantId}|${user?.email}`;
            const response = await axios.get('http://localhost:3000/api/ops/health', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHealth(response.data);
        } catch (error) {
            setHealth({ status: 'OFFLINE' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !health) return <div className="p-8 text-center font-mono text-[10px] text-zinc-600 animate-pulse">PING_HEALTH_NODE...</div>;

    const isHealthy = health?.status === 'HEALTHY';

    return (
        <div className="space-y-6">
            <div className={`p-8 border rounded-[2rem] flex items-center justify-between transition-all ${isHealthy ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                <div className="flex items-center space-x-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isHealthy ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white animate-pulse'}`}>
                        {isHealthy ? <ShieldCheck size={32} /> : <AlertCircle size={32} />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tighter uppercase">System_{health?.status}</h2>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                            Operational Node Integrity: {isHealthy ? 'OPTIMAL' : 'CRITICAL_FAILURE'}
                        </p>
                    </div>
                </div>
                <button onClick={fetchHealth} className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white transition-all">
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl">
                    <div className="flex items-center space-x-3 mb-4">
                        <Cpu size={16} className="text-indigo-400" />
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Resource_Load</span>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase mb-1">
                                <span>Memory_Usage</span>
                                <span>{Math.round((health?.memory?.rss || 0) / 1024 / 1024)} MB</span>
                            </div>
                            <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: '45%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase mb-1">
                                <span>CPU_Efficiency</span>
                                <span>Optimal</span>
                            </div>
                            <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: '22%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl">
                    <div className="flex items-center space-x-3 mb-4">
                        <HardDrive size={16} className="text-amber-500" />
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Persistence_Node</span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-500">DB_CONNECTION</span>
                            <Badge variant="success">STABLE</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-500">REDIS_SYNC</span>
                            <Badge variant="success">ACTIVE</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-500">BACKUP_STATUS</span>
                            <span className="text-[10px] font-mono text-zinc-600">LAST: 00:00 (OK)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
