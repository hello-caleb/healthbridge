"use client";

import Link from "next/link";
import { ArrowRight, Play, Activity, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[var(--brand-teal)]/20 rounded-full blur-[120px] animate-float-slow mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[var(--brand-violet)]/20 rounded-full blur-[120px] animate-float-slower mix-blend-screen" />
                <div className="absolute top-[20%] left-[30%] w-[30vw] h-[30vw] bg-[var(--brand-coral)]/10 rounded-full blur-[100px] animate-float mix-blend-screen" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left: Content */}
                <div className="flex flex-col gap-8 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                        <Sparkles className="w-4 h-4 text-[var(--brand-coral)]" />
                        <span className="text-xs font-medium tracking-wide uppercase text-white/80">Powered by Gemini 3.0</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1] animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                        Breaking barriers in <br />
                        <span className="text-gradient-bridge">healthcare access.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/60 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                        HealthBridge bridges the communication gap between deaf patients and healthcare providers using real-time ASL translation and clinical reasoning.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                        <Link href="/demo">
                            <Button size="lg" className="w-full sm:w-auto shadow-[0_0_30px_-5px_rgba(249,112,102,0.4)]">
                                Try Interactive Demo <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                        <Link href="/technology">
                            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                                How it works <Activity className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </div>

                    <div className="pt-8 flex items-center gap-8 justify-center lg:justify-start opacity-0 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold text-white">95%</span>
                            <span className="text-sm text-white/40 uppercase tracking-wider">Accuracy</span>
                        </div>
                        <div className="w-px h-12 bg-white/10" />
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold text-white">&lt;100ms</span>
                            <span className="text-sm text-white/40 uppercase tracking-wider">Latency</span>
                        </div>
                        <div className="w-px h-12 bg-white/10" />
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold text-white">24/7</span>
                            <span className="text-sm text-white/40 uppercase tracking-wider">Availability</span>
                        </div>
                    </div>
                </div>

                {/* Right: Abstract Visual */}
                <div className="relative h-[600px] hidden lg:flex items-center justify-center perspective-1000">
                    {/* Floating Cards Simulation */}
                    <div className="relative w-full max-w-md aspect-[3/4] preserve-3d animate-float-slow">
                        {/* Back Card (Doctor) */}
                        <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-[var(--brand-violet)]/10 backdrop-blur-xl border border-[var(--brand-violet)]/20 rounded-3xl transform rotate-6 translate-x-12 translate-y-[-20px] shadow-2xl flex flex-col p-6 z-10 transition-transform duration-500 hover:rotate-3 hover:translate-y-[-30px]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-[var(--brand-violet)]/20 flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-[var(--brand-violet)]" />
                                </div>
                                <div className="h-2 w-24 bg-white/10 rounded-full" />
                            </div>
                            <div className="space-y-3">
                                <div className="h-2 w-full bg-white/5 rounded-full" />
                                <div className="h-2 w-5/6 bg-white/5 rounded-full" />
                                <div className="h-2 w-4/6 bg-white/5 rounded-full" />
                            </div>
                            <div className="mt-auto p-4 bg-[var(--brand-violet)]/5 rounded-xl border border-[var(--brand-violet)]/10">
                                <div className="h-2 w-full bg-[var(--brand-violet)]/20 rounded-full animate-pulse" />
                            </div>
                        </div>

                        {/* Front Card (Patient) */}
                        <div className="absolute bottom-0 left-0 w-3/4 h-3/4 bg-[var(--brand-teal)]/10 backdrop-blur-xl border border-[var(--brand-teal)]/20 rounded-3xl transform -rotate-3 translate-x-[-20px] shadow-2xl flex flex-col p-6 z-20 transition-transform duration-500 hover:rotate-0 hover:translate-y-[-10px]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-[var(--brand-teal)]/20 flex items-center justify-center">
                                    <Play className="w-5 h-5 text-[var(--brand-teal)] ml-1" />
                                </div>
                                <div className="h-2 w-24 bg-white/10 rounded-full" />
                            </div>
                            <div className="flex-1 bg-black/20 rounded-2xl overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--brand-teal)]/20 to-transparent opacity-50" />
                                <div className="absolute bottom-4 left-4 right-4 h-12 bg-white/10 backdrop-blur-md rounded-lg border border-white/5 flex items-center px-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-teal)] animate-pulse mr-2" />
                                    <div className="h-1.5 w-2/3 bg-white/20 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
