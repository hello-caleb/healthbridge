'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Hand, Camera, CameraOff, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { useHandLandmarker, HandFrame } from '@/hooks/use-hand-landmarker';
import { translateASLFrames, ASLTranslationResult } from '@/lib/asl-translation-service';

interface ASLInputProps {
    onTranslation?: (result: ASLTranslationResult) => void;
    isEnabled?: boolean;
}

export function ASLInput({ onTranslation, isEnabled = true }: ASLInputProps) {
    // Local refs for video and canvas
    const videoElementRef = useRef<HTMLVideoElement>(null);
    const canvasElementRef = useRef<HTMLCanvasElement>(null);

    // Translation state
    const [isTranslating, setIsTranslating] = useState(false);
    const [lastTranslation, setLastTranslation] = useState<ASLTranslationResult | null>(null);
    const [translationHistory, setTranslationHistory] = useState<ASLTranslationResult[]>([]);

    // Handle completed sign
    const handleSignComplete = useCallback(async (frames: HandFrame[]) => {
        if (isTranslating) return; // Prevent overlapping translations

        setIsTranslating(true);
        console.log(`🖐️ Processing ${frames.length} frames for ASL translation...`);

        try {
            const result = await translateASLFrames(frames);

            if (result.confidence !== 'unclear') {
                setLastTranslation(result);
                setTranslationHistory(prev => [result, ...prev].slice(0, 10)); // Keep last 10

                if (onTranslation) {
                    onTranslation(result);
                }
            }
        } catch (error) {
            console.error('Translation failed:', error);
        } finally {
            setIsTranslating(false);
        }
    }, [isTranslating, onTranslation]);

    // Initialize hand landmarker
    const {
        isInitialized,
        isDetecting,
        handsDetected,
        isCapturing,
        error,
        initialize,
        startDetection,
        stopDetection,
    } = useHandLandmarker({ onSignComplete: handleSignComplete });

    // Start detection when component mounts and is enabled
    useEffect(() => {
        if (isEnabled && videoElementRef.current && canvasElementRef.current) {
            startDetection(videoElementRef.current, canvasElementRef.current);
        }

        return () => {
            stopDetection();
        };
    }, [isEnabled, startDetection, stopDetection]);

    // Toggle detection
    const toggleDetection = async () => {
        if (isDetecting) {
            stopDetection();
        } else if (videoElementRef.current && canvasElementRef.current) {
            await startDetection(videoElementRef.current, canvasElementRef.current);
        }
    };

    return (
        <div className="relative flex flex-col h-full">
            {/* Video/Canvas container */}
            <div className="relative flex-1 rounded-2xl overflow-hidden bg-black/50 border border-white/10">
                {/* Hidden video element (source for MediaPipe) */}
                <video
                    ref={videoElementRef}
                    className="hidden"
                    playsInline
                    muted
                />

                {/* Canvas with landmark overlay (visible) */}
                <canvas
                    ref={canvasElementRef}
                    className="w-full h-full object-cover"
                />

                {/* Status overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                    {/* ASL Mode indicator */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-400/30 backdrop-blur-sm">
                        <Hand className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                            ASL Mode
                        </span>
                    </div>

                    {/* Detection status */}
                    {isDetecting && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-sm border ${handsDetected
                            ? 'bg-emerald-500/20 border-emerald-400/30'
                            : 'bg-white/10 border-white/20'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${handsDetected ? 'bg-emerald-400 animate-pulse' : 'bg-white/50'
                                }`} />
                            <span className={`text-xs font-bold uppercase tracking-wider ${handsDetected ? 'text-emerald-300' : 'text-white/50'
                                }`}>
                                {handsDetected ? 'Hands Detected' : 'Waiting...'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Capturing indicator */}
                {isCapturing && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-400/30 backdrop-blur-sm animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="text-xs font-bold text-red-300 uppercase tracking-wider">
                            Recording Sign
                        </span>
                    </div>
                )}

                {/* Translating overlay */}
                {isTranslating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                            <span className="text-sm font-bold text-white">Translating...</span>
                        </div>
                    </div>
                )}

                {/* Not detecting overlay */}
                {!isDetecting && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                <Hand className="w-10 h-10 text-white/50" />
                            </div>
                            <p className="text-white/60 text-sm">ASL detection paused</p>
                            <button
                                onClick={toggleDetection}
                                className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold transition-colors"
                            >
                                Enable ASL Input
                            </button>
                        </div>
                    </div>
                )}

                {/* RED SQUARE GUIDE (Viewfinder) */}
                {isDetecting && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 transition-opacity duration-300">
                        {/* The Guide Box */}
                        <div className="relative w-[85%] h-[85%] border-2 border-red-500/50 rounded-2xl shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-500 -mt-[2px] -ml-[2px] rounded-tl-xl" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-500 -mt-[2px] -mr-[2px] rounded-tr-xl" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-500 -mb-[2px] -ml-[2px] rounded-bl-xl" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-500 -mb-[2px] -mr-[2px] rounded-br-xl" />

                            {/* Label */}
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-500/80 px-2 py-0.5 rounded text-[10px] font-bold text-white tracking-widest uppercase">
                                Active Zone
                            </div>
                        </div>
                    </div>
                )}

                {/* Error display */}
                {error && (
                    <div className="absolute bottom-3 left-3 right-3 p-3 rounded-lg bg-red-500/20 border border-red-400/30">
                        <p className="text-xs text-red-300">{error}</p>
                    </div>
                )}

                {/* Control button */}
                {isDetecting && (
                    <button
                        onClick={toggleDetection}
                        className="absolute bottom-3 right-3 flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/80 hover:bg-red-600 border border-white/20 transition-all shadow-lg backdrop-blur-sm group"
                        title="Turn off camera"
                    >
                        <CameraOff className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold text-white">Turn Camera Off</span>
                    </button>
                )}
            </div>

            {/* Removed internal translation overlay to prevent obstruction */}
        </div>
    );
}
