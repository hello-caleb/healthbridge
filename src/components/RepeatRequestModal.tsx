'use client';

/**
 * RepeatRequestModal
 * 
 * Modal displayed to the patient when the doctor requests they repeat their sign.
 * Shows reason for request and provides intuitive acknowledgment flow.
 */

import React from 'react';
import { RotateCcw, AlertCircle, HelpCircle, X } from 'lucide-react';
import { RepeatRequest } from '@/lib/session-communication';

interface RepeatRequestModalProps {
    request: RepeatRequest | null;
    onAcknowledge: () => void;
    onDismiss?: () => void;
}

export function RepeatRequestModal({
    request,
    onAcknowledge,
    onDismiss,
}: RepeatRequestModalProps) {
    if (!request) return null;

    const reasonConfig = {
        low_confidence: {
            icon: AlertCircle,
            title: "Doctor requires clarification",
            message: "The translation confidence was low. Please sign your message again clearly.",
            color: "orange",
        },
        unclear: {
            icon: HelpCircle,
            title: "Doctor requires clarification",
            message: "The doctor wasn't sure about the translation. Please sign your message again.",
            color: "amber",
        },
        manual: {
            icon: RotateCcw,
            title: "Please repeat your sign",
            message: "The doctor would like you to sign that again for better understanding.",
            color: "blue",
        },
    };

    const config = reasonConfig[request.reason];
    const Icon = config.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onDismiss}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-300">
                <div className={`
                    relative p-8 rounded-3xl 
                    bg-gradient-to-br from-slate-900 to-slate-800
                    border border-${config.color}-500/30
                    shadow-2xl shadow-${config.color}-500/10
                `}>
                    {/* Close button (optional) */}
                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    {/* Icon */}
                    <div className={`
                        w-20 h-20 mx-auto mb-6 rounded-full 
                        flex items-center justify-center
                        bg-${config.color}-500/20
                        animate-pulse
                    `}>
                        <Icon className={`w-10 h-10 text-${config.color}-400`} />
                    </div>

                    {/* Content */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-3">
                            {config.title}
                        </h2>
                        <p className="text-white/70 leading-relaxed">
                            {config.message}
                        </p>
                    </div>

                    {/* Tips */}
                    <div className="bg-white/5 rounded-2xl p-4 mb-8">
                        <p className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">
                            Tips for clear signing:
                        </p>
                        <ul className="space-y-2 text-sm text-white/60">
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-400 mt-0.5">•</span>
                                Ensure your hands are clearly visible in frame
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-400 mt-0.5">•</span>
                                Sign at a steady, moderate pace
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-400 mt-0.5">•</span>
                                Face the camera directly with good lighting
                            </li>
                        </ul>
                    </div>

                    {/* Acknowledge Button */}
                    <button
                        onClick={onAcknowledge}
                        className={`
                            w-full py-4 rounded-2xl font-bold text-lg
                            bg-gradient-to-r from-${config.color}-500 to-${config.color}-600
                            hover:from-${config.color}-600 hover:to-${config.color}-700
                            text-white shadow-lg shadow-${config.color}-500/20
                            transform transition-all hover:scale-[1.02] active:scale-[0.98]
                        `}
                    >
                        I'm ready to sign again
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RepeatRequestModal;
