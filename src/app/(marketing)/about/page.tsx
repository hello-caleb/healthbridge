"use client";

import Section from "@/components/ui/Section";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Github, Linkedin, Mail, ArrowRight, Code, Database, Globe, Brain, Video } from "lucide-react";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[var(--bg-darkest)] selection:bg-[var(--brand-coral)]/30 pt-20">
            {/* Header */}
            <Section className="text-center pt-24 pb-12">
                <span className="text-[var(--brand-coral)] font-mono text-xs uppercase tracking-widest mb-4 block animate-fade-in-up">The Mission</span>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                    Bridging the gap in <br /> <span className="text-gradient-bridge">health equity.</span>
                </h1>
                <p className="text-lg text-white/60 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                    HealthBridge was born from a simple belief: communication barriers should never compromise the quality of healthcare.
                </p>
            </Section>

            {/* Story Section */}
            <Section className="py-12">
                <GlassCard className="p-8 md:p-12 rounded-[3rem] border-t-4 border-t-[var(--brand-coral)]">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl font-bold text-white mb-6">Why HealthBridge?</h2>
                        <div className="space-y-6 text-white/70 leading-relaxed text-lg">
                            <p>
                                For millions of Deaf and Hard of Hearing individuals, visiting a doctor can be a source of anxiety and frustration. Professional interpreters aren't always available, and family members shouldn't have to translate sensitive medical information.
                            </p>
                            <p>
                                Leveraging the multimodal capabilities of <span className="text-white font-semibold">Gemini 3</span>, we built HealthBridge to provide an always-on, privacy-first alternative. It doesn't just translate words; it interprets context, ensuring that clinical nuance is preserved and patient autonomy is respected.
                            </p>
                        </div>

                        <div className="mt-12 flex flex-col md:flex-row gap-6 border-t border-white/10 pt-8">
                            <div className="flex-1">
                                <span className="block text-4xl font-bold text-white mb-2">300+</span>
                                <span className="text-sm text-white/40 uppercase tracking-wider">Million Deaf/HoH People</span>
                            </div>
                            <div className="flex-1">
                                <span className="block text-4xl font-bold text-white mb-2">&lt;1%</span>
                                <span className="text-sm text-white/40 uppercase tracking-wider">Medical Professionals sign ASL</span>
                            </div>
                            <div className="flex-1">
                                <span className="block text-4xl font-bold text-white mb-2">24/7</span>
                                <span className="text-sm text-white/40 uppercase tracking-wider">Automated Availability</span>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </Section>

            {/* Tech Stack */}
            <Section className="py-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white mb-4">Built with intent.</h2>
                    <p className="text-white/60">A modern stack for a modern problem.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: Brain, name: "Gemini 3 Pro", desc: "Multimodal Reasoning" },
                        { icon: Video, name: "LiveKit", desc: "WebRTC Streaming" },
                        { icon: Globe, name: "Next.js 14", desc: "App Router / Edge" },
                        { icon: Code, name: "Tailwind v4", desc: "Design System" },
                    ].map((tech, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors">
                            <tech.icon className="w-8 h-8 text-white/20 mx-auto mb-4" />
                            <div className="font-bold text-white">{tech.name}</div>
                            <div className="text-xs text-white/40 uppercase tracking-wider mt-1">{tech.desc}</div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Creator / Team */}
            <Section className="py-24 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                    <span className="w-2 h-2 rounded-full bg-[var(--brand-coral)] animate-pulse" />
                    <span className="text-sm font-medium text-white/80">Active Development</span>
                </div>

                <h2 className="text-2xl font-bold text-white mb-8">Get Involved</h2>

                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="https://github.com/calebhunter/gemini-3-healthbridge" target="_blank">
                        <Button variant="secondary" className="bg-white/5 hover:bg-white/10">
                            <Github className="w-5 h-5 mr-2" /> View on GitHub
                        </Button>
                    </Link>
                    <Link href="https://devpost.com" target="_blank">
                        <Button variant="secondary" className="bg-white/5 hover:bg-white/10">
                            <Code className="w-5 h-5 mr-2" /> Check Devpost
                        </Button>
                    </Link>
                </div>
            </Section>
        </main>
    );
}
