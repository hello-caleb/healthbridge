'use client';

import { useMemo } from 'react';
import { Speaker, SpeakerSegment } from '@/types/speaker';

/**
 * Parses a raw transcript string into speaker-attributed segments.
 * Looks for [Doctor] and [Patient] tags and splits accordingly.
 * 
 * @param transcript - Raw transcript string with speaker tags
 * @returns Array of SpeakerSegment objects with speaker attribution
 */
export function useSpeakerDiarization(transcript: string): SpeakerSegment[] {
    return useMemo(() => {
        if (!transcript || transcript.trim() === '') {
            return [];
        }

        const segments: SpeakerSegment[] = [];

        // Regex to match speaker tags and capture the text after them
        // Matches [Doctor] or [Patient] followed by text until the next tag or end
        const tagPattern = /\[(Doctor|Patient)\]\s*/gi;

        let lastIndex = 0;
        let lastSpeaker: Speaker = 'unknown';
        let match;

        // Find all speaker tags
        const matches: { tag: Speaker; index: number; length: number }[] = [];

        while ((match = tagPattern.exec(transcript)) !== null) {
            const speakerTag = match[1].toLowerCase() as 'doctor' | 'patient';
            matches.push({
                tag: speakerTag,
                index: match.index,
                length: match[0].length
            });
        }

        // If no tags found, return the whole transcript as unknown speaker
        if (matches.length === 0) {
            const trimmedText = transcript.trim();
            if (trimmedText) {
                segments.push({
                    speaker: 'unknown',
                    text: trimmedText,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
            }
            return segments;
        }

        // Handle any text before the first tag
        if (matches[0].index > 0) {
            const beforeText = transcript.substring(0, matches[0].index).trim();
            if (beforeText) {
                segments.push({
                    speaker: 'unknown',
                    text: beforeText,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
            }
        }

        // Process each tagged segment
        for (let i = 0; i < matches.length; i++) {
            const currentMatch = matches[i];
            const nextMatch = matches[i + 1];

            const textStart = currentMatch.index + currentMatch.length;
            const textEnd = nextMatch ? nextMatch.index : transcript.length;

            const text = transcript.substring(textStart, textEnd).trim();

            if (text) {
                segments.push({
                    speaker: currentMatch.tag,
                    text: text,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
            }
        }

        return segments;
    }, [transcript]);
}

/**
 * Gets the CSS classes for a speaker segment
 */
export function getSpeakerStyles(speaker: Speaker): {
    container: string;
    badge: string;
    badgeText: string;
} {
    switch (speaker) {
        case 'doctor':
            return {
                container: 'bg-blue-50 border-l-4 border-blue-500',
                badge: 'bg-blue-100 text-blue-800',
                badgeText: 'Doctor'
            };
        case 'patient':
            return {
                container: 'bg-green-50 border-l-4 border-green-500',
                badge: 'bg-green-100 text-green-800',
                badgeText: 'Patient'
            };
        default:
            return {
                container: 'bg-slate-50 border-l-4 border-slate-300',
                badge: 'bg-slate-100 text-slate-600',
                badgeText: 'Unknown'
            };
    }
}
