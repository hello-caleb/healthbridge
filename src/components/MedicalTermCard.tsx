'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export interface MedicalTermCardProps {
    term: string;
    definition: string;
    timestamp?: string;
    isNew?: boolean;
}

export function MedicalTermCard({ term, definition, timestamp, isNew = false }: MedicalTermCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Truncate definition for preview
    const previewLength = 60;
    const needsTruncation = definition.length > previewLength;
    const previewText = needsTruncation
        ? definition.substring(0, previewLength) + '...'
        : definition;

    return (
        <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
                group relative flex-shrink-0 
                w-[260px] min-h-[120px]
                rounded-2xl p-4
                text-left transition-all duration-300 ease-out
                cursor-pointer
                ${isNew
                    ? 'animate-card-pop-in'
                    : ''
                }
                ${isExpanded
                    ? 'w-[320px] bg-white/15 border-white/30'
                    : 'bg-white/8 hover:bg-white/12 border-white/10 hover:border-white/20'
                }
                border backdrop-blur-xl
                hover:scale-[1.02] active:scale-[0.98]
            `}
        >
            {/* New term glow indicator */}
            {isNew && (
                <div className="absolute -top-1 -right-1 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">New</span>
                </div>
            )}

            {/* Term title */}
            <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg font-bold text-white capitalize leading-tight">
                    {term}
                </h3>
                <div className={`
                    flex items-center justify-center w-6 h-6 rounded-full
                    bg-white/10 text-white/60
                    transition-transform duration-200
                    ${isExpanded ? 'rotate-180' : ''}
                `}>
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>

            {/* Definition */}
            <p className={`
                text-sm leading-relaxed transition-all duration-300
                ${isExpanded
                    ? 'text-white/90'
                    : 'text-white/60'
                }
            `}>
                {isExpanded ? definition : previewText}
            </p>

            {/* Timestamp */}
            {timestamp && (
                <div className="mt-3 pt-2 border-t border-white/10">
                    <span className="text-xs text-white/40 font-medium">{timestamp}</span>
                </div>
            )}

            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 -z-10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 blur-xl" />
            </div>
        </button>
    );
}
