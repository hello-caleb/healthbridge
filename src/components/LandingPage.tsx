'use client';

import React from 'react';
import { Play, Heart, MessageSquare, Hand, Shield, Sparkles, ArrowRight, ChevronRight, Github } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden">
            {/* Organic background shapes */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-emerald-900/20 to-transparent blur-3xl animate-float-slow" />
                <div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-purple-900/10 to-transparent blur-3xl animate-float-slower" />
                <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-teal-900/15 to-transparent blur-3xl animate-float" />
            </div>

            {/* Navigation */}
            <nav className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Heart className="h-6 w-6 text-emerald-400" />
                    <h1 className="text-xl font-bold tracking-tight">
                        <span className="text-white">Health</span>
                        <span className="text-emerald-400">Bridge</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors text-sm"
                    >
                        <Github className="h-4 w-4" />
                        GitHub
                    </a>
                    <Link
                        href="/session"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors"
                    >
                        Launch App
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-20 pb-16">
                {/* Badge */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-300">Gemini 3 Hackathon 2026</span>
                </div>

                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 max-w-4xl">
                    <span className="text-white">Breaking barriers in </span>
                    <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">healthcare communication</span>
                </h2>

                <p className="text-lg md:text-xl text-white/60 max-w-2xl mb-10">
                    Real-time medical transcription and jargon simplification for Deaf and Hard-of-Hearing patients.
                    Now with ASL recognition powered by Gemini Vision.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link
                        href="/session?demo=true"
                        className="group flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-lg transition-all shadow-lg shadow-emerald-500/25"
                    >
                        <Play className="h-5 w-5" />
                        Watch Demo
                        <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="/session"
                        className="flex items-center gap-2 px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-lg transition-colors"
                    >
                        Try Live Session
                    </Link>
                </div>
            </section>

            {/* Features Grid */}
            <section className="relative z-10 px-6 py-16">
                <div className="max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-center text-white/90 mb-12">
                        Powered by Gemini AI
                    </h3>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Feature 1: Real-time Transcription */}
                        <div className="relative group rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-8 hover:border-emerald-500/30 transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                                <MessageSquare className="h-7 w-7 text-emerald-400" />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-3">Real-time Transcription</h4>
                            <p className="text-white/50 leading-relaxed">
                                Gemini 2.5 Flash native audio streams doctor-patient conversations with speaker diarization.
                                Know who said what, instantly.
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-sm">
                                <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 font-medium">Doctor</span>
                                <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 font-medium">Patient</span>
                            </div>
                        </div>

                        {/* Feature 2: Medical Jargon */}
                        <div className="relative group rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-8 hover:border-amber-500/30 transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
                                <Heart className="h-7 w-7 text-amber-400" />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-3">Jargon Simplification</h4>
                            <p className="text-white/50 leading-relaxed">
                                Medical terms automatically detected and explained in plain language.
                                Understanding your diagnosis shouldn't require a medical degree.
                            </p>
                            <div className="mt-4 text-sm text-white/40">
                                <span className="font-medium text-amber-400">"Arrhythmia"</span> → Irregular heartbeat
                            </div>
                        </div>

                        {/* Feature 3: ASL Recognition */}
                        <div className="relative group rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-8 hover:border-purple-500/30 transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
                                <Hand className="h-7 w-7 text-purple-400" />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-3">ASL Recognition</h4>
                            <p className="text-white/50 leading-relaxed">
                                MediaPipe hand tracking + Gemini Vision translates American Sign Language in real-time.
                                True two-way communication.
                            </p>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 font-medium">NEW</span>
                                <span className="text-sm text-white/40">Powered by Gemini Vision</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="relative z-10 px-6 py-16 border-t border-white/5">
                <div className="max-w-4xl mx-auto text-center">
                    <h3 className="text-2xl font-bold text-white/90 mb-12">How It Works</h3>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1 text-center">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 text-lg font-bold">1</div>
                            <h4 className="font-bold text-white mb-2">Connect</h4>
                            <p className="text-sm text-white/50">Join a video call with your healthcare provider</p>
                        </div>
                        <div className="hidden md:block w-16 h-px bg-gradient-to-r from-emerald-500/50 to-purple-500/50" />
                        <div className="flex-1 text-center">
                            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 text-lg font-bold">2</div>
                            <h4 className="font-bold text-white mb-2">Communicate</h4>
                            <p className="text-sm text-white/50">Speak or sign — HealthBridge understands both</p>
                        </div>
                        <div className="hidden md:block w-16 h-px bg-gradient-to-r from-amber-500/50 to-purple-500/50" />
                        <div className="flex-1 text-center">
                            <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-4 text-lg font-bold">3</div>
                            <h4 className="font-bold text-white mb-2">Understand</h4>
                            <p className="text-sm text-white/50">Read simplified explanations of medical terms</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Security Note */}
            <section className="relative z-10 px-6 py-12">
                <div className="max-w-2xl mx-auto">
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 flex items-start gap-4">
                        <Shield className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-white mb-2">Privacy First</h4>
                            <p className="text-sm text-white/50">
                                HealthBridge is a communication tool that helps translate medical terminology. It does not provide medical advice, diagnoses, or treatment recommendations.
                                No health data is stored. All transcription happens in real-time and is not retained after your session.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 px-6 py-8">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-white/50">
                        <Heart className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm">HealthBridge • Gemini 3 Hackathon 2026</span>
                    </div>
                    <p className="text-sm text-white/30">
                        Built with Gemini 3, MediaPipe, and Next.js
                    </p>
                </div>
            </footer>
        </div>
    );
}
