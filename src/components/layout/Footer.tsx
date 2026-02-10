import React from "react";
import Link from "next/link";
import Section from "@/components/ui/Section";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="w-full bg-[#05050A] border-t border-white/5">
            <Section className="py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-tr from-brand-teal to-brand-violet rounded-lg">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    className="w-5 h-5 text-white"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M12 2v20M2 12h20" />
                                    <path d="M4.93 4.93l14.14 14.14" />
                                    <path d="M19.07 4.93L4.93 19.07" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">
                                HealthBridge
                            </span>
                        </Link>
                        <p className="text-white/50 text-sm leading-relaxed max-w-sm">
                            An AI-powered communication bridge specifically designed for complex
                            medical interactions, ensuring no critical information is lost in translation.
                        </p>
                    </div>

                    {/* Links Column */}
                    <div>
                        <h4 className="text-white font-semibold mb-6">Product</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/features" className="text-white/50 hover:text-brand-teal transition-colors text-sm">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="/technology" className="text-white/50 hover:text-brand-teal transition-colors text-sm">
                                    Technology
                                </Link>
                            </li>
                            <li>
                                <Link href="/demo" className="text-white/50 hover:text-brand-teal transition-colors text-sm">
                                    Live Demo
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h4 className="text-white font-semibold mb-6">Company</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/about" className="text-white/50 hover:text-brand-teal transition-colors text-sm">
                                    About
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="https://github.com/calebhunted/health-bridge"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white/50 hover:text-brand-teal transition-colors text-sm"
                                >
                                    GitHub
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Disclaimer & Copyright */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-white/30 text-xs">
                        © {year} HealthBridge. Built for Gemini Developer Competition.
                    </p>

                    <div className="bg-brand-coral/10 border border-brand-coral/20 rounded-lg p-4 max-w-xl">
                        <p className="text-brand-coral text-xs font-medium flex items-start gap-2">
                            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>
                                <strong>Disclaimer:</strong> HealthBridge is a prototype demonstration.
                                It does not provide medical advice, diagnosis, or treatment.
                                The AI references are simulated. Always seek the advice of a qualified health provider.
                            </span>
                        </p>
                    </div>
                </div>
            </Section>
        </footer>
    );
}
