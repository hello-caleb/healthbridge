"use client";

import { MessageSquare, Brain, Lock, Globe, FileText, ChevronRight, type LucideIcon } from "lucide-react";

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    delay: string;
}

function FeatureCard({ icon: Icon, title, description, delay }: FeatureCardProps) {
    return (
        <div className="glass-card p-8 rounded-3xl flex flex-col gap-4 group hover:bg-white/[0.08] transition-all duration-300 animate-fade-in-up" style={{ animationDelay: delay }}>
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6 text-[var(--brand-teal)] group-hover:text-[var(--brand-coral)] transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-semibold text-white group-hover:text-[var(--brand-coral)] transition-colors duration-300">{title}</h3>
            <p className="text-white/60 leading-relaxed">{description}</p>
        </div>
    );
}

export default function FeaturesGrid() {
    const features = [
        {
            icon: MessageSquare,
            title: "Real-time Translation",
            description: "Seamless bi-directional translation between ASL (Sign Language) and spoken English with <100ms latency.",
            delay: "0.1s",
        },
        {
            icon: Brain,
            title: "Clinical Reasoning",
            description: "AI-powered detection of medical jargon providing instant, plain-English explanations for patients.",
            delay: "0.2s",
        },
        {
            icon: Lock,
            title: "Secure by Design",
            description: "End-to-end encryption ensures patient data privacy and HIPAA compliance standards are met.",
            delay: "0.3s",
        },
        {
            icon: Globe,
            title: "Accessible Anywhere",
            description: "Browser-based platform requiring no specialized hardware—just a webcam and an internet connection.",
            delay: "0.4s",
        },
        {
            icon: FileText,
            title: "Smart Synthesis",
            description: "Automated session summaries and medical record integration to streamline doctor workflows.",
            delay: "0.5s",
        },
    ];

    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="mb-16 md:text-center max-w-2xl mx-auto">
                    <span className="text-[var(--brand-teal)] font-mono text-xs uppercase tracking-widest mb-4 block">Key Capabilities</span>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Designed for the modern <br /> clinical encounter.</h2>
                    <p className="text-lg text-white/60">
                        HealthBridge combines advanced computer vision with large language models to create a seamless communication experience.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}

                    {/* Call to Action Card */}
                    <div className="glass-card p-8 rounded-3xl flex flex-col justify-between group hover:border-[var(--brand-teal)]/50 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
                        <div>
                            <h3 className="text-2xl font-semibold text-white mb-2">Ready to see more?</h3>
                            <p className="text-white/60">Explore the full feature set and technical architecture.</p>
                        </div>
                        <a href="/features" className="inline-flex items-center gap-2 text-[var(--brand-teal)] font-medium mt-8 group-hover:translate-x-2 transition-transform">
                            View all features <ChevronRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
