import React from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    href?: string;
    className?: string;
    icon?: React.ReactNode;
}

export default function Button({
    children,
    variant = "primary",
    size = "md",
    href,
    className = "",
    icon,
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A0A0F]";

    const variants: Record<ButtonVariant, string> = {
        primary: "bg-gradient-to-r from-brand-coral to-orange-400 text-white hover:opacity-90 shadow-lg shadow-brand-coral/20 active:scale-[0.98]",
        secondary: "bg-white/10 text-white hover:bg-white/15 backdrop-blur-sm border border-white/10 active:scale-[0.98]",
        ghost: "text-white/70 hover:text-white hover:bg-white/5 active:scale-[0.98]",
        outline: "border border-brand-teal/50 text-brand-teal hover:bg-brand-teal/10 active:scale-[0.98]",
    };

    const sizes: Record<ButtonSize, string> = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
    };

    const styles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    if (href) {
        return (
            <Link href={href} className={styles}>
                {icon && <span className="mr-2">{icon}</span>}
                {children}
            </Link>
        );
    }

    return (
        <button className={styles} {...props}>
            {icon && <span className="mr-2">{icon}</span>}
            {children}
        </button>
    );
}
