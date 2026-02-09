/**
 * Hook for managing demo mode playback
 * Simulates a real-time conversation for hackathon judges
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { CARDIOLOGY_DEMO_TRANSCRIPT, DemoLine, getTotalDemoDuration } from '@/lib/demo-transcript';
import { MedicalTerm } from '@/hooks/use-gemini-client';
import { SpeakerSegment } from '@/types/speaker';

interface UseDemoModeProps {
    enabled: boolean;
    onComplete?: () => void;
}

interface UseDemoModeReturn {
    isPlaying: boolean;
    progress: number; // 0-100
    currentLineIndex: number;
    transcript: SpeakerSegment[];
    medicalTerms: MedicalTerm[];
    startDemo: () => void;
    stopDemo: () => void;
    restartDemo: () => void;
}

export function useDemoMode({ enabled, onComplete }: UseDemoModeProps): UseDemoModeReturn {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentLineIndex, setCurrentLineIndex] = useState(-1);
    const [transcript, setTranscript] = useState<SpeakerSegment[]>([]);
    const [medicalTerms, setMedicalTerms] = useState<MedicalTerm[]>([]);
    const [progress, setProgress] = useState(0);

    const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
    const startTimeRef = useRef<number>(0);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const clearAllTimeouts = useCallback(() => {
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
    }, []);

    const formatTimestamp = (index: number): string => {
        const minutes = Math.floor(index * 0.4); // Roughly 24 seconds per line
        const seconds = Math.floor((index * 24) % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const startDemo = useCallback(() => {
        if (!enabled) return;

        clearAllTimeouts();
        setIsPlaying(true);
        setCurrentLineIndex(-1);
        setTranscript([]);
        setMedicalTerms([]);
        setProgress(0);
        startTimeRef.current = Date.now();

        const totalDuration = getTotalDemoDuration();

        // Progress bar updater
        progressIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
            setProgress(newProgress);
        }, 100);

        // Schedule each line
        CARDIOLOGY_DEMO_TRANSCRIPT.forEach((line, index) => {
            const timeout = setTimeout(() => {
                setCurrentLineIndex(index);

                // Add to transcript
                const segment: SpeakerSegment = {
                    speaker: line.speaker,
                    text: line.text,
                    timestamp: formatTimestamp(index),
                    inputType: line.inputType || 'audio',
                };
                setTranscript(prev => [...prev, segment]);

                // Add medical terms if present
                if (line.medicalTerms) {
                    const newTerms: MedicalTerm[] = line.medicalTerms.map(term => ({
                        term: term.term,
                        definition: term.definition,
                        timestamp: formatTimestamp(index),
                    }));
                    setMedicalTerms(prev => [...prev, ...newTerms]);
                }

                // Check if this is the last line
                if (index === CARDIOLOGY_DEMO_TRANSCRIPT.length - 1) {
                    // Demo complete after a short delay
                    const completeTimeout = setTimeout(() => {
                        setIsPlaying(false);
                        if (progressIntervalRef.current) {
                            clearInterval(progressIntervalRef.current);
                        }
                        setProgress(100);
                        onComplete?.();
                    }, 3000);
                    timeoutsRef.current.push(completeTimeout);
                }
            }, line.delay);

            timeoutsRef.current.push(timeout);
        });
    }, [enabled, clearAllTimeouts, onComplete]);

    const stopDemo = useCallback(() => {
        clearAllTimeouts();
        setIsPlaying(false);
    }, [clearAllTimeouts]);

    const restartDemo = useCallback(() => {
        stopDemo();
        // Small delay before restarting
        setTimeout(startDemo, 100);
    }, [stopDemo, startDemo]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearAllTimeouts();
        };
    }, [clearAllTimeouts]);

    // Auto-start if enabled and we detect demo mode param
    useEffect(() => {
        if (enabled && typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('autoplay') === 'true') {
                startDemo();
            }
        }
    }, [enabled, startDemo]);

    return {
        isPlaying,
        progress,
        currentLineIndex,
        transcript,
        medicalTerms,
        startDemo,
        stopDemo,
        restartDemo,
    };
}
