"use client";

import { Video, Mic, Brain, Database, FileJson, Server } from "lucide-react";

export default function ArchitectureDiagram() {
    return (
        <div className="relative w-full max-w-4xl mx-auto h-[500px] border border-white/5 rounded-3xl bg-white/[0.02] backdrop-blur-sm p-8 flex items-center justify-center overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

            {/* Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <path d="M200 150 C 350 150, 350 250, 450 250" fill="none" stroke="var(--brand-teal)" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_20s_linear_infinite]" />
                <path d="M200 350 C 350 350, 350 250, 450 250" fill="none" stroke="var(--brand-violet)" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_20s_linear_infinite]" />
                <path d="M550 250 C 650 250, 650 250, 750 250" fill="none" stroke="var(--brand-coral)" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_20s_linear_infinite]" />
            </svg>

            <div className="relative z-10 grid grid-cols-3 gap-16 w-full items-center">

                {/* Inputs Column */}
                <div className="flex flex-col gap-12">
                    <div className="glass-card p-4 rounded-2xl border-l-4 border-[var(--brand-teal)] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--brand-teal)]/20 flex items-center justify-center">
                            <Video className="w-5 h-5 text-[var(--brand-teal)]" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white">Patient Video</div>
                            <div className="text-xs text-white/50">WebRTC Stream</div>
                        </div>
                    </div>

                    <div className="glass-card p-4 rounded-2xl border-l-4 border-[var(--brand-violet)] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--brand-violet)]/20 flex items-center justify-center">
                            <Mic className="w-5 h-5 text-[var(--brand-violet)]" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white">Doctor Audio</div>
                            <div className="text-xs text-white/50">WebRTC Stream</div>
                        </div>
                    </div>
                </div>

                {/* Processing Column (Central) */}
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--brand-violet)] to-[var(--brand-coral)] p-1 animate-pulse shadow-[0_0_50px_rgba(167,139,250,0.3)]">
                        <div className="w-full h-full rounded-full bg-[#0A0A0F] flex flex-col items-center justify-center border border-white/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                            <Brain className="w-10 h-10 text-white mb-2 relative z-10" />
                            <span className="text-xs font-bold text-white tracking-widest relative z-10">GEMINI 3</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <span className="text-[10px] uppercase font-mono text-[var(--brand-teal)] bg-[var(--brand-teal)]/10 px-2 py-1 rounded">Vision</span>
                        <span className="mx-1 text-white/20">+</span>
                        <span className="text-[10px] uppercase font-mono text-[var(--brand-violet)] bg-[var(--brand-violet)]/10 px-2 py-1 rounded">Audio</span>
                    </div>
                </div>

                {/* Outputs Column */}
                <div className="flex flex-col gap-12">
                    <div className="glass-card p-4 rounded-2xl border-r-4 border-[var(--brand-coral)] flex flex-row-reverse items-center gap-3 text-right">
                        <div className="w-10 h-10 rounded-full bg-[var(--brand-coral)]/20 flex items-center justify-center">
                            <FileJson className="w-5 h-5 text-[var(--brand-coral)]" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white">Structured Data</div>
                            <div className="text-xs text-white/50">JSON / FHIR</div>
                        </div>
                    </div>

                    <div className="glass-card p-4 rounded-2xl border-r-4 border-[var(--brand-coral)] flex flex-row-reverse items-center gap-3 text-right">
                        <div className="w-10 h-10 rounded-full bg-[var(--brand-coral)]/20 flex items-center justify-center">
                            <Server className="w-5 h-5 text-[var(--brand-coral)]" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white">EHR Integration</div>
                            <div className="text-xs text-white/50">Secure Sync</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
