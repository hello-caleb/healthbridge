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
                    <img
                        src="/logo-text.png"
                        alt="HealthBridge Logo"
                        className="h-8 w-auto object-contain"
                    />
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
