"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";

export default function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const links = [
        { href: "/", label: "Home" },
        { href: "/features", label: "Features" },
        { href: "/technology", label: "Technology" },
        { href: "/about", label: "About" },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent ${scrolled
                ? "bg-[#0A0A0F]/80 backdrop-blur-xl border-white/5 py-4"
                : "bg-transparent py-6"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative w-8 h-8 flex items-center justify-center bg-gradient-to-tr from-brand-teal to-brand-violet rounded-lg shadow-lg group-hover:shadow-brand-teal/20 transition-all duration-300">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            className="w-5 h-5 text-white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 2v20M2 12h20" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <path d="M4.93 4.93l14.14 14.14" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75" />
                            <path d="M19.07 4.93L4.93 19.07" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150" />
                            <circle cx="12" cy="12" r="3" className="group-hover:scale-0 transition-transform duration-300" />
                        </svg>
                        <div className="absolute inset-0 bg-white/20 rounded-lg blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white group-hover:text-white/90 transition-colors">
                        HealthBridge
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-sm font-medium transition-colors hover:text-brand-teal ${pathname === link.href ? "text-white" : "text-white/60"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-4">
                    <Button
                        href="/demo"
                        variant="primary"
                        size="sm"
                        className="hidden md:inline-flex rounded-full"
                    >
                        Try Demo
                    </Button>

                    {/* Mobile Menu Toggle (Simplified for now) */}
                    <button className="md:hidden text-white/80 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
}
