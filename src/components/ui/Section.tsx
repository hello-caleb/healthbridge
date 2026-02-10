import React from "react";

interface SectionProps {
    children: React.ReactNode;
    id?: string;
    className?: string;
    fullWidth?: boolean;
}

export default function Section({
    children,
    id = "",
    className = "",
    fullWidth = false,
}: SectionProps) {
    return (
        <section id={id} className={`w-full py-24 ${className}`}>
            <div className={fullWidth ? "w-full" : "max-w-7xl mx-auto px-4 md:px-8"}>
                {children}
            </div>
        </section>
    );
}
