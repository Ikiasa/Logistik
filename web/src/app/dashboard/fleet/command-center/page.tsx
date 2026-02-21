'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { TacticalLayout } from '@/modules/fleet/TacticalLayout';
import { TacticalKPI } from '@/modules/fleet/TacticalKPI';
import { TacticalAlertCard } from '@/modules/fleet/TacticalAlertCard';
import { Shield, Radio, Activity, Terminal, Crosshair, Zap, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

const FleetLiveMap = dynamic(() => import('@/modules/fleet/FleetLiveMap').then(mod => mod.FleetLiveMap), { ssr: false });

export default function TacticalCommandCenterPage() {
    const [systemStatus, setSystemStatus] = useState('ONLINE');

    return (
        <TacticalLayout
            topBar={
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-3">
                            <div className="p-1.5 bg-tactical-green/10 border border-tactical-green/30">
                                <Shield className="text-tactical-green" size={18} />
                            </div>
                            <div>
                                <h1 className="text-sm font-black tracking-[0.3em] text-white">COMMAND_CENTER_v4.2</h1>
                                <p className="text-[9px] font-mono text-tactical-green uppercase">Authorized Access: Operational Level 5</p>
                            </div>
                        </div>

                        <div className="h-8 w-px bg-tactical-border"></div>

                        <div className="flex space-x-0">
                            <TacticalKPI label="FLEET_READY" value="142" color="green" />
                            <TacticalKPI label="IN_TRANSIT" value="86" color="green" trend="up" />
                            <TacticalKPI label="IDLE_STBY" value="12" color="amber" />
                            <TacticalKPI label="SLA_BREACH" value="03" color="red" trend="down" />
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-zinc-500 uppercase">SYS_STABILITY</span>
                            <div className="flex space-x-0.5">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className={`w-1 h-3 ${i < 7 ? 'bg-tactical-green' : 'bg-tactical-green/20'}`}></div>
                                ))}
                            </div>
                        </div>
                        <Badge variant="success" className="bg-tactical-green/10 text-tactical-green border-tactical-green/30 animate-pulse">
                            SIGNAL: ENCRYPTED
                        </Badge>
                    </div>
                </div>
            }
            leftPanel={
                <div className="space-y-0 text-[10px]">
                    <div className="p-4 bg-white/5 border-b border-tactical-border">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-black text-zinc-500 uppercase">Sector: Jakarta_Metro</span>
                            <Crosshair size={12} className="text-tactical-green" />
                        </div>
                        <div className="space-y-2">
                            {[
                                { id: 'TRK-9902', status: 'ACTIVE', speed: '42' },
                                { id: 'TRK-8812', status: 'ACTIVE', speed: '65' },
                                { id: 'TRK-7721', status: 'STANDBY', speed: '00' },
                                { id: 'TRK-6643', status: 'ACTIVE', speed: '38' },
                                { id: 'TRK-5511', status: 'WARNING', speed: '02' },
                            ].map((v, idx) => (
                                <div key={v.id} className="flex justify-between items-center py-2 border-b border-white/5 hover:bg-tactical-green/5 transition-colors group cursor-crosshair">
                                    <span className="font-mono text-white group-hover:text-tactical-green">[{idx}] {v.id}</span>
                                    <span className={v.status === 'WARNING' ? 'text-tactical-amber' : 'text-tactical-green'}>{v.speed} KM/H</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 bg-tactical-red/5 border-b border-tactical-red/10">
                        <div className="flex items-center space-x-2 mb-3 text-tactical-red">
                            <AlertCircle size={14} />
                            <span className="font-black uppercase tracking-widest">Breach_Priority_01</span>
                        </div>
                        <p className="text-[9px] text-zinc-400 font-bold uppercase leading-relaxed mb-3">
                            Unauthorized detour detected in Sector_B4. Escalating to logistics dispatcher.
                        </p>
                        <button className="w-full py-2 bg-tactical-red/20 border border-tactical-red/40 text-tactical-red font-black text-[9px] uppercase tracking-widest hover:bg-tactical-red/40 transition-all">
                            INTERCEPT_SIGNAL
                        </button>
                    </div>
                </div>
            }
            mainContent={<FleetLiveMap />}
            rightPanel={
                <>
                    <TacticalAlertCard
                        type="EMERGENCY"
                        vehicleId="v-101"
                        message="SLA mismatch: Delivery overdue by 42 minutes. Immediate intervention required."
                        timestamp="12:21:44"
                    />
                    <TacticalAlertCard
                        type="SPEED"
                        vehicleId="v-109"
                        message="Velocity threshold exceeded: 104 km/h in restricted urban corridor."
                        timestamp="12:20:12"
                    />
                    <TacticalAlertCard
                        type="GEOFENCE"
                        vehicleId="v-202"
                        message="Vehicle departed authorized route perimeter: Sub-sector 12-A."
                        timestamp="12:18:05"
                    />
                    <TacticalAlertCard
                        type="IDLE"
                        vehicleId="v-88"
                        message="Stationary threshold reached: 15 minutes without engine activity."
                        timestamp="12:15:33"
                    />
                </>
            }
            bottomTimeline={
                <div className="flex items-center h-full space-x-6">
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                            <div className="p-1 px-2 border border-tactical-green/50 text-tactical-green text-[9px] font-black">PLAYBACK</div>
                            <div className="p-1 px-2 text-zinc-500 text-[9px] font-black">REALTIME_FEED</div>
                        </div>
                        <div className="flex items-center space-x-1">
                            <button className="p-2 hover:bg-white/10 text-tactical-green transition-colors"><Radio size={14} /></button>
                            <button className="p-2 hover:bg-white/10 text-tactical-green transition-colors"><Activity size={14} /></button>
                            <button className="p-2 hover:bg-white/10 text-tactical-green transition-colors"><Zap size={14} /></button>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="flex justify-between text-[8px] font-black text-zinc-600 uppercase mb-1 tracking-widest">
                            <span>T-24_HOURS</span>
                            <span>T-12_HOURS</span>
                            <span>CURRENT_TIME</span>
                        </div>
                        <div className="h-6 w-full bg-black/40 border border-tactical-border relative flex items-center px-4 overflow-hidden">
                            <div className="absolute left-[30%] h-full w-0.5 bg-tactical-green/20"></div>
                            <div className="absolute left-[60%] h-full w-0.5 bg-tactical-green/20"></div>
                            <div className="absolute left-[75%] h-full w-2 bg-tactical-red/40 animate-pulse"></div>
                            <div className="w-full h-px bg-tactical-green/20"></div>
                            <div className="absolute right-4 h-4 w-1 bg-tactical-green tactical-text-glow"></div>
                        </div>
                    </div>
                    <div className="w-48 bg-black/40 border border-tactical-border p-2 flex flex-col justify-between">
                        <div className="flex justify-between items-center text-[8px] font-black opacity-40">
                            <span>LAT: -6.2088</span>
                            <span>LNG: 106.8456</span>
                        </div>
                        <div className="text-[10px] font-mono text-white text-center">
                            {new Date().toISOString().replace('T', ' ').slice(0, 19)}
                        </div>
                    </div>
                </div>
            }
        />
    );
}
