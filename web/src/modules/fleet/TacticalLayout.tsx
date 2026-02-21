'use client';

import React from 'react';

interface TacticalLayoutProps {
    topBar: React.ReactNode;
    leftPanel: React.ReactNode;
    mainContent: React.ReactNode;
    rightPanel: React.ReactNode;
    bottomTimeline: React.ReactNode;
}

export const TacticalLayout: React.FC<TacticalLayoutProps> = ({
    topBar,
    leftPanel,
    mainContent,
    rightPanel,
    bottomTimeline
}) => {
    return (
        <div className="h-screen w-full bg-tactical-bg overflow-hidden flex flex-col font-mono text-tactical-green selection:bg-tactical-green selection:text-black">
            {/* Top Operational Bar */}
            <div className="h-14 border-b border-tactical-border bg-tactical-bg/80 backdrop-blur-xl z-50 flex items-center px-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                {topBar}
            </div>

            {/* Main Operations Area */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Background Grid Overlay */}
                <div className="absolute inset-0 tactical-grid-overlay opacity-50 pointer-events-none"></div>

                {/* Left Intel Panel */}
                <aside className="w-80 border-r border-tactical-border bg-tactical-panel/60 backdrop-blur-md flex flex-col z-40">
                    <div className="p-4 border-b border-tactical-border bg-black/40">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Intelligence_Stream</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                        {leftPanel}
                    </div>
                </aside>

                {/* Central Tactical Map */}
                <main className="flex-1 relative flex flex-col bg-black">
                    <div className="flex-1 overflow-hidden relative">
                        {mainContent}

                        {/* Tactical Vignette */}
                        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] z-10"></div>
                    </div>

                    {/* Bottom Operational Timeline */}
                    <div className="h-24 border-t border-tactical-border bg-tactical-panel/80 backdrop-blur-md z-40 p-4">
                        {bottomTimeline}
                    </div>
                </main>

                {/* Right Alert Panel */}
                <aside className="w-96 border-l border-tactical-border bg-tactical-panel/60 backdrop-blur-md flex flex-col z-40">
                    <div className="p-4 border-b border-tactical-border bg-black/40 flex justify-between items-center">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Operational_Alerts</h2>
                        <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-tactical-red animate-pulse"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-tactical-amber"></div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                        {rightPanel}
                    </div>
                </aside>
            </div>

            {/* HUD Scanline Effect */}
            <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
        </div>
    );
};
