'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Play, Pause, RotateCcw, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const createHistoryIcon = () => L.divIcon({
    className: 'history-icon',
    html: `<div style="background-color: #6366f1; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
});

export const RoutePlayback: React.FC<{ vehicleId: string }> = ({ vehicleId }) => {
    const { user } = useAuthStore();
    const [history, setHistory] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isLoaded, setIsLoaded] = useState(false);

    const fetchHistory = async () => {
        if (!user) return;
        try {
            const to = new Date().toISOString();
            const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

            const token = `mock-jwt|${user.id}|${user.tenantId}|${user.email}`;
            const response = await axios.get(`http://localhost:3000/api/tracking/history?vehicle_id=${vehicleId}&from=${from}&to=${to}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setHistory(response.data);
            setIsLoaded(true);
            setCurrentIndex(0);
        } catch (error) {
            console.error('Failed to fetch tracking history:', error);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && currentIndex < history.length - 1) {
            interval = setInterval(() => {
                setCurrentIndex(prev => prev + 1);
            }, 1000 / playbackSpeed);
        } else {
            setIsPlaying(false);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentIndex, history.length, playbackSpeed]);

    const currentPos = history[currentIndex];
    const polylinePositions = history.slice(0, currentIndex + 1).map(h => [h.latitude, h.longitude]);

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-900 rounded-2xl">
                <div className="flex items-center space-x-4">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <Calendar size={16} className="text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Playback Controls</p>
                        <p className="text-xs font-bold text-white">Last 24 Hours Archive</p>
                    </div>
                </div>

                <div className="flex space-x-2">
                    {!isLoaded ? (
                        <Button variant="secondary" onClick={fetchHistory}>
                            <Calendar size={14} className="mr-2" /> Load History
                        </Button>
                    ) : (
                        <>
                            <Button variant="secondary" onClick={() => setCurrentIndex(0)}>
                                <RotateCcw size={14} />
                            </Button>
                            <Button
                                variant={isPlaying ? 'secondary' : 'primary'}
                                onClick={() => setIsPlaying(!isPlaying)}
                                className={!isPlaying ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                            >
                                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                            </Button>
                            <select
                                value={playbackSpeed}
                                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 text-[10px] font-bold text-white outline-none"
                            >
                                <option value={1}>1x Speed</option>
                                <option value={2}>2x Speed</option>
                                <option value={4}>4x Speed</option>
                            </select>
                        </>
                    )}
                </div>
            </div>

            <div className="flex-1 bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden relative min-h-[400px]">
                <MapContainer
                    center={[-6.200000, 106.816666]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    {history.length > 0 && (
                        <>
                            <Polyline positions={polylinePositions} color="#6366f1" weight={4} />
                            {currentPos && (
                                <Marker position={[currentPos.latitude, currentPos.longitude]} icon={createHistoryIcon()} />
                            )}
                        </>
                    )}
                </MapContainer>

                {isLoaded && currentPos && (
                    <div className="absolute bottom-6 left-6 z-[1000] p-4 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded-2xl shadow-2xl min-w-[200px]">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Timestamp</span>
                                <span className="text-[10px] font-mono text-white">{new Date(currentPos.recorded_at).toLocaleTimeString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Velocity</span>
                                <span className="text-[10px] font-mono text-white">{currentPos.speed} KM/H</span>
                            </div>
                            <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 transition-all duration-300"
                                    style={{ width: `${(currentIndex / (history.length - 1)) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
