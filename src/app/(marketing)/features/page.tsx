"use client";

import Section from "@/components/ui/Section";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { MessageSquare, Brain, FileText, Video, ArrowRight, Check } from "lucide-react";

export default function FeaturesPage() {
    return (
        <main className="min-h-screen bg-[var(--bg-darkest)] selection:bg-[var(--brand-teal)]/30 pt-20">
            {/* Header */}
            <Section className="text-center pt-24 pb-12">
                <span className="text-[var(--brand-teal)] font-mono text-xs uppercase tracking-widest mb-4 block animate-fade-in-up">Platform Capabilities</span>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                    A complete suite for <br /> <span className="text-gradient-bridge">inclusive healthcare.</span>
                </h1>
                <p className="text-lg text-white/60 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                    HealthBridge empowers providers to deliver equitable care through advanced AI translation and clinical reasoning tools.
                </p>
            </Section>

            {/* Feature 1: Translation */}
            <Section className="py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1 relative h-[400px] w-full animate-fade-in-left">
                        {/* Visual Placeholder */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--brand-teal)]/20 to-[var(--brand-violet)]/20 rounded-3xl blur-3xl opacity-30 animate-float" />
                        <GlassCard className="h-full w-full relative z-10 flex flex-col justify-center items-center overflow-hidden border-white/10">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
                            <div className="w-24 h-24 rounded-full bg-[var(--brand-teal)]/20 flex items-center justify-center mb-6 ring-1 ring-[var(--brand-teal)]/40 animate-pulse">
                                <MessageSquare className="w-10 h-10 text-[var(--brand-teal)]" />
                            </div>
                            <div className="space-y-3 w-2/3">
                                <div className="h-3 w-full bg-white/10 rounded-full animate-shimmer" style={{ backgroundSize: "200% 100%" }} />
                                <div className="h-3 w-4/5 bg-white/10 rounded-full animate-shimmer" style={{ backgroundSize: "200% 100%", animationDelay: "0.2s" }} />
                                <div className="h-3 w-full bg-white/10 rounded-full animate-shimmer" style={{ backgroundSize: "200% 100%", animationDelay: "0.4s" }} />
                            </div>
                        </GlassCard>
                    </div>
                    <div className="order-1 lg:order-2">
                        <div className="w-12 h-12 rounded-xl bg-[var(--brand-teal)]/10 flex items-center justify-center mb-6">
                            <MessageSquare className="w-6 h-6 text-[var(--brand-teal)]" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-6">Real-time ASL Translation</h2>
                        <p className="text-white/70 mb-8 leading-relaxed">
                            Our proprietary computer vision model translates American Sign Language (ASL) into spoken text with <span className="text-white font-semibold">under 100ms latency</span>. It captures nuance, emotion, and context, ensuring nothing is lost in translation.
                        </p>
                        <ul className="space-y-4 mb-8">
                            {[
                                "Bi-directional communication (ASL <-> English)",
                                "Hands-free operation for natural signing",
                                "Context-aware processing for medical terminology"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                                    <div className="w-5 h-5 rounded-full bg-[var(--brand-teal)]/20 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-[var(--brand-teal)]" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </Section>

            {/* Feature 2: Clinical Reasoning */}
            <Section className="py-24 bg-white/[0.02]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="w-12 h-12 rounded-xl bg-[var(--brand-violet)]/10 flex items-center justify-center mb-6">
                            <Brain className="w-6 h-6 text-[var(--brand-violet)]" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-6">Clinical Decision Support</h2>
                        <p className="text-white/70 mb-8 leading-relaxed">
                            Powered by Gemini 3 Pro, HealthBridge analyzes the conversation in real-time to detect medical jargon and provide instant, plain-language explanations for patients, enhancing health literacy.
                        </p>
                        <ul className="space-y-4 mb-8">
                            {[
                                "Real-time jargon detection and simplification",
                                "Contextual medical term definitions",
                                "Patient comprehension checks"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                                    <div className="w-5 h-5 rounded-full bg-[var(--brand-violet)]/20 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-[var(--brand-violet)]" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="relative h-[400px] w-full animate-fade-in-up">
                        {/* Visual Placeholder */}
                        <div className="absolute inset-0 bg-gradient-to-bl from-[var(--brand-violet)]/20 to-[var(--brand-coral)]/20 rounded-3xl blur-3xl opacity-30 animate-float-slow" />
                        <GlassCard className="h-full w-full relative z-10 flex flex-col p-8 border-[var(--brand-violet)]/20">
                            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                                <span className="text-xs font-mono text-[var(--brand-violet)]">LIVE ANALYSIS</span>
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-green-500/50" />
                                </div>
                            </div>
                            <div className="space-y-4 font-mono text-sm">
                                <div className="p-3 rounded bg-[var(--brand-violet)]/10 border-l-2 border-[var(--brand-violet)] text-white/90">
                                    <span className="text-[var(--brand-violet)] opacity-70">Detect:</span> "Myocardial Infarction"
                                </div>
                                <div className="flex justify-center">
                                    <div className="w-px h-4 bg-white/20" />
                                </div>
                                <div className="p-3 rounded bg-[var(--brand-teal)]/10 border-l-2 border-[var(--brand-teal)] text-white/90">
                                    <span className="text-[var(--brand-teal)] opacity-70">Simplify:</span> "Heart Attack"
                                </div>
                                <div className="mt-4 text-xs text-white/40 italic">
                                    Explanation: Blockage of blood flow to the heart muscle.
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </Section>

            {/* Feature 3: Smart Synthesis */}
            <Section className="py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1 relative h-[400px] w-full animate-fade-in-left">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-coral)]/20 to-[var(--brand-teal)]/20 rounded-3xl blur-3xl opacity-30 animate-float" />
                        <GlassCard className="h-full w-full relative z-10 p-8 border-[var(--brand-coral)]/20 flex flex-col">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-6">
                                <FileText className="w-4 h-4 text-white" />
                            </div>
                            <div className="space-y-2 mb-6">
                                <div className="h-2 w-1/3 bg-white/20 rounded-full" />
                                <div className="h-6 w-3/4 bg-white/10 rounded-lg" />
                            </div>
                            <div className="flex-1 bg-black/20 rounded-xl p-4 font-mono text-xs text-white/60 leading-relaxed overflow-hidden">
                                <p className="mb-2"><span className="text-[var(--brand-coral)]">SUMMARY:</span> Patient presented with chest pain lasting 2 hours. History of hypertension.</p>
                                <p className="mb-2"><span className="text-[var(--brand-coral)]">VITALS:</span> BP 150/95, HR 98.</p>
                                <p><span className="text-[var(--brand-coral)]">PLAN:</span> ECG ordering, nitroglycerin administration...</p>
                            </div>
                        </GlassCard>
                    </div>
                    <div className="order-1 lg:order-2">
                        <div className="w-12 h-12 rounded-xl bg-[var(--brand-coral)]/10 flex items-center justify-center mb-6">
                            <FileText className="w-6 h-6 text-[var(--brand-coral)]" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-6">Smart Synthesis</h2>
                        <p className="text-white/70 mb-8 leading-relaxed">
                            Keep your focus on the patient, not the screen. HealthBridge automatically generates structured clinical notes, summaries, and follow-up instructions after every session.
                        </p>
                        <ul className="space-y-4 mb-8">
                            {[
                                "Automated SOAP note generation",
                                "Integration with major EHR systems",
                                "Patient-friendly summary for discharge instructions"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                                    <div className="w-5 h-5 rounded-full bg-[var(--brand-coral)]/20 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-[var(--brand-coral)]" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </Section>

            {/* CTA */}
            <Section className="py-24 text-center">
                <GlassCard className="max-w-4xl mx-auto p-12 md:p-16 rounded-[3rem] relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--brand-violet)]/10 rounded-full blur-[100px] pointer-events-none" />
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">Ready to transform your practice?</h2>
                    <p className="text-lg text-white/60 max-w-xl mx-auto mb-10 relative z-10">
                        Join the waiting list for early access or try our interactive demo today to see the future of inclusive care.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                        <Link href="/demo">
                            <Button size="lg" className="px-8">
                                Launch Demo Simulation <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </GlassCard>
            </Section>
        </main>
    );
}
