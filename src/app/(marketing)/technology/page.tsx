"use client";

import Section from "@/components/ui/Section";
import GlassCard from "@/components/ui/GlassCard";
import ArchitectureDiagram from "@/components/technology/ArchitectureDiagram";
import { Cpu, Zap, Shield, Layers } from "lucide-react";

export default function TechnologyPage() {
    return (
        <main className="min-h-screen bg-[var(--bg-darkest)] selection:bg-[var(--brand-violet)]/30 pt-20">
            {/* Header */}
            <Section className="text-center pt-24 pb-12">
                <span className="text-[var(--brand-violet)] font-mono text-xs uppercase tracking-widest mb-4 block animate-fade-in-up">Under the Hood</span>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                    Built on the bleeding edge of <br /> <span className="text-gradient-bridge">multimodal AI.</span>
                </h1>
                <p className="text-lg text-white/60 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                    HealthBridge leverages Gemini 3's native multimodal capabilities to process video, audio, and text simultaneously with unprecedented speed and accuracy.
                </p>
            </Section>

            {/* Architecture Diagram */}
            <Section className="py-12">
                <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                    <ArchitectureDiagram />
                </div>
                <div className="text-center mt-8 text-white/40 text-sm font-mono uppercase tracking-widest">
                    System Architecture v1.0
                </div>
            </Section>

            {/* Deep Dive Grid */}
            <Section className="py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GlassCard className="p-8 rounded-3xl border-t-4 border-t-[var(--brand-violet)]">
                        <div className="w-12 h-12 rounded-xl bg-[var(--brand-violet)]/10 flex items-center justify-center mb-6">
                            <Layers className="w-6 h-6 text-[var(--brand-violet)]" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">Native Multimodality</h3>
                        <p className="text-white/60 leading-relaxed">
                            Unlike traditional systems that stitch together separate speech-to-text and vision models, HealthBridge uses Gemini 3's native understanding of video and audio streams. This reduces latency and improves context retention across modalities.
                        </p>
                    </GlassCard>

                    <GlassCard className="p-8 rounded-3xl border-t-4 border-t-[var(--brand-teal)]">
                        <div className="w-12 h-12 rounded-xl bg-[var(--brand-teal)]/10 flex items-center justify-center mb-6">
                            <Zap className="w-6 h-6 text-[var(--brand-teal)]" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">Real-time Performance</h3>
                        <p className="text-white/60 leading-relaxed">
                            Optimized for the edge, our pipeline achieves sub-100ms latency for sign language translation. We utilize WebRTC for zero-lag streaming and efficient frame sampling to minimize bandwidth usage without resolving to cloud-only processing.
                        </p>
                    </GlassCard>

                    <GlassCard className="p-8 rounded-3xl border-t-4 border-t-[var(--brand-coral)]">
                        <div className="w-12 h-12 rounded-xl bg-[var(--brand-coral)]/10 flex items-center justify-center mb-6">
                            <Cpu className="w-6 h-6 text-[var(--brand-coral)]" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">Long Context Reasoning</h3>
                        <p className="text-white/60 leading-relaxed">
                            With Gemini 3's extended context window, HealthBridge can reference a patient's entire medical history during the consultation, flagging contraindications and suggesting personalized care plans in real-time.
                        </p>
                    </GlassCard>

                    <GlassCard className="p-8 rounded-3xl border-t-4 border-t-white/50">
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">Enterprise Grade Security</h3>
                        <p className="text-white/60 leading-relaxed">
                            All data streams are encrypted in transit and at rest. We adhere to strict HIPAA guidelines, ensuring that PII is masked before processing and that no session data is used for model training without explicit consent.
                        </p>
                    </GlassCard>
                </div>
            </Section>
        </main>
    );
}
