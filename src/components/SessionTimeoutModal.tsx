'use client';

import React from 'react';
import { Clock, RefreshCw } from 'lucide-react';

interface SessionTimeoutModalProps {
    isOpen: boolean;
    timeRemaining: number;  // seconds
    onContinue: () => void;
}

/**
 * Accessible modal warning for session timeout
 * Designed with DHH users in mind - high contrast, large text, clear actions
 */
export function SessionTimeoutModal({ isOpen, timeRemaining, onContinue }: SessionTimeoutModalProps) {
    if (!isOpen) return null;

    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const timeDisplay = minutes > 0
        ? `${minutes}:${seconds.toString().padStart(2, '0')}`
        : `${seconds} seconds`;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="timeout-title"
            aria-describedby="timeout-description"
        >
            <div className="mx-4 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border-4 border-amber-400 animate-in zoom-in-95 fade-in duration-200">
                {/* Icon */}
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
                    <Clock className="h-10 w-10 text-amber-600" aria-hidden="true" />
                </div>

                {/* Title */}
                <h2
                    id="timeout-title"
                    className="text-center text-3xl font-bold text-slate-900 mb-4"
                >
                    Session Ending Soon
                </h2>

                {/* Countdown - Extra Large for visibility */}
                <div
                    className="text-center mb-4"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    <span className="text-5xl font-bold text-amber-600 tabular-nums">
                        {timeDisplay}
                    </span>
                </div>

                {/* Description */}
                <p
                    id="timeout-description"
                    className="text-center text-xl text-slate-600 mb-8 leading-relaxed"
                >
                    Your session will end due to inactivity.
                    Click below to continue your consultation.
                </p>

                {/* Action Button - Large touch target */}
                <button
                    onClick={onContinue}
                    className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-blue-600 text-white text-xl font-bold rounded-2xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all shadow-lg"
                    aria-label="Continue session and reset timeout"
                    autoFocus
                >
                    <RefreshCw className="h-6 w-6" aria-hidden="true" />
                    Continue Session
                </button>

                {/* Accessibility note */}
                <p className="mt-6 text-center text-sm text-slate-400">
                    Press Enter or click above to stay connected
                </p>
            </div>
        </div>
    );
}

export default SessionTimeoutModal;
