import React from "react";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export default function GlassCard({
    children,
    className = "",
    hoverEffect = false,
}: GlassCardProps) {
    return (
        <div
            className={`
        ${hoverEffect ? "glass-card" : "glass-panel"}
        rounded-2xl p-6
        ${className}
      `}
        >
            {children}
        </div>
    );
}
