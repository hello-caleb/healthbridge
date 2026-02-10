"use client";

import { ShieldCheck, Server, BadgeCheck, Stethoscope } from "lucide-react";

export default function TrustBar() {
    const items = [
        { icon: ShieldCheck, text: "HIPAA Compliant" },
        { icon: BadgeCheck, text: "SOC2 Ready" },
        { icon: Server, text: "End-to-End Encrypted" },
        { icon: Stethoscope, text: "Clinician Approved" },
    ];

    return (
        <section className="border-y border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <div className="container mx-auto px-6 py-8">
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
                    {items.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 opacity-50 hover:opacity-80 transition-opacity grayscale hover:grayscale-0">
                            <item.icon className="w-5 h-5 text-[var(--brand-teal)]" />
                            <span className="text-sm font-medium tracking-widest uppercase text-white">{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
