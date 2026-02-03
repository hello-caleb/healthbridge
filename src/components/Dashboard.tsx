'use client';

import React from 'react';
import { Video, Mic, Globe, Info } from 'lucide-react';

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-neutral-900 text-white p-4 font-sans">
            {/* Header */}
            <header className="mb-4 flex items-center justify-between border-b border-neutral-700 pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-blue-400">HealthBridge</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 rounded-full bg-red-900/50 px-3 py-1 text-red-200">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                        <span className="text-sm font-medium">Live</span>
                    </div>
                    <button className="rounded-full bg-neutral-800 p-2 hover:bg-neutral-700" aria-label="Settings">
                        <Globe className="h-5 w-5" />
                    </button>
                </div>
            </header>

            {/* Main Grid */}
            <main className="grid h-[calc(100vh-100px)] grid-cols-1 gap-4 lg:grid-cols-12">
                {/* Video Feeds Area (Left/Center) */}
                <section className="relative col-span-1 flex flex-col gap-4 lg:col-span-9 lg:h-full">
                    {/* Video Grid */}
                    <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Doctor Feed */}
                        <div className="relative flex min-h-[300px] items-center justify-center rounded-2xl bg-neutral-800 border border-neutral-700">
                            <div className="text-center text-neutral-500">
                                <Video className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                <span className="text-lg">Doctor Feed (Connecting...)</span>
                            </div>
                            <div className="absolute bottom-4 left-4 rounded bg-black/60 px-2 py-1 text-sm font-semibold">Doctor</div>
                        </div>

                        {/* Patient Feed */}
                        <div className="relative flex min-h-[300px] items-center justify-center rounded-2xl bg-neutral-800 border border-neutral-700">
                            <div className="text-center text-neutral-500">
                                <Mic className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                <span className="text-lg">Patient Feed (Local)</span>
                            </div>
                            <div className="absolute bottom-4 left-4 rounded bg-black/60 px-2 py-1 text-sm font-semibold">You</div>
                        </div>
                    </div>

                    {/* Live Captions Overlay */}
                    <div className="min-h-[150px] shrink-0 rounded-2xl bg-neutral-950 p-6 border border-neutral-800 shadow-2xl">
                        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-neutral-500">Live Transcript</h2>
                        <p className="text-xl leading-relaxed text-yellow-300 lg:text-3xl font-medium" aria-live="polite">
                            Waiting for speech input...
                        </p>
                    </div>
                </section>

                {/* Side Panel: Jargon & Insights (Right) */}
                <aside className="col-span-1 flex flex-col rounded-2xl bg-neutral-800 p-4 lg:col-span-3 border border-neutral-700">
                    <div className="mb-4 flex items-center gap-2 border-b border-neutral-700 pb-2">
                        <Info className="h-5 w-5 text-blue-400" />
                        <h2 className="font-semibold">Medical Terms</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {/* Mock Item */}
                        <div className="rounded-xl bg-neutral-700/50 p-3">
                            <div className="mb-1 flex items-baseline justify-between">
                                <span className="font-bold text-blue-300">Hypertension</span>
                                <span className="text-xs text-neutral-400">10:42 AM</span>
                            </div>
                            <p className="text-sm text-neutral-200">
                                High blood pressure. It means the force of the blood pushing against your artery walls is too high.
                            </p>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}
