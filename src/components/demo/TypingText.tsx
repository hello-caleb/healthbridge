"use client";

import { useState, useEffect } from "react";

interface TypingTextProps {
    text: string;
    speed?: number;
    delay?: number;
    className?: string;
    startTyping?: boolean;
    cursorColor?: string;
    onComplete?: () => void;
}

export default function TypingText({
    text,
    speed = 30,
    delay = 0,
    className = "",
    startTyping = true,
    cursorColor = "bg-emerald-400",
    onComplete,
}: TypingTextProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        setDisplayedText("");
        setCurrentIndex(0);
        setIsComplete(false);
    }, [text]); // Reset when text changes

    useEffect(() => {
        if (!startTyping || (isComplete && currentIndex === text.length)) return;

        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + text[currentIndex]);
                setCurrentIndex((prev) => prev + 1);
            }, currentIndex === 0 ? delay : speed + (Math.random() * 20)); // Subtle random variation for realism

            return () => clearTimeout(timeout);
        } else {
            setIsComplete(true);
            if (onComplete) onComplete();
        }
    }, [currentIndex, text, speed, delay, startTyping, isComplete, onComplete]);

    return (
        <span className={className}>
            {displayedText}
            {(!isComplete && startTyping) && (
                <span className={`inline-block w-[2px] h-[1em] ml-1 animate-pulse ${cursorColor}`} />
            )}
        </span>
    );
}

