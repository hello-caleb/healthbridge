'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Play, Pause, Upload, Video, RotateCcw } from 'lucide-react';
import { useHandLandmarker, HandFrame } from '@/hooks/use-hand-landmarker';
import { translateASLFrames, ASLTranslationResult } from '@/lib/asl-translation-service';

interface ASLTestModeProps {
    onTranslation?: (result: ASLTranslationResult) => void;
}

/**
 * ASL Test Mode - Play video files through the ASL recognition pipeline
 * Useful for testing with consistent ASL video samples
 */
export function ASLTestMode({ onTranslation }: ASLTestModeProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [lastTranslation, setLastTranslation] = useState<ASLTranslationResult | null>(null);
    const [translations, setTranslations] = useState<ASLTranslationResult[]>([]);

    // Handle sign completion
    const handleSignComplete = useCallback(async (frames: HandFrame[]) => {
        if (isTranslating) return;

        setIsTranslating(true);
        console.log(`🎬 [Test Mode] Processing ${frames.length} frames...`);

        try {
            const result = await translateASLFrames(frames);

            if (result.confidence !== 'unclear') {
                setLastTranslation(result);
                setTranslations(prev => [result, ...prev].slice(0, 20));
                onTranslation?.(result);
            }
        } catch (error) {
            console.error('Translation failed:', error);
        } finally {
            setIsTranslating(false);
        }
    }, [isTranslating, onTranslation]);

    // Hand landmarker hook
    const {
        isInitialized,
        isDetecting,
        handsDetected,
        error,
        startDetection,
        stopDetection,
    } = useHandLandmarker({ onSignComplete: handleSignComplete });

    // Handle file upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setVideoSrc(url);
            setTranslations([]);
            setLastTranslation(null);
        }
    };

    // Start playback and detection
    const startTest = async () => {
        if (!videoRef.current || !canvasRef.current || !videoSrc) return;

        // Start detection on video element
        await startDetection(videoRef.current, canvasRef.current);

        // Start video playback
        videoRef.current.currentTime = 0;
        videoRef.current.play();
        setIsPlaying(true);
    };

    // Stop/pause
    const stopTest = () => {
        if (videoRef.current) {
            videoRef.current.pause();
        }
        stopDetection();
        setIsPlaying(false);
    };

    // Reset
    const resetTest = () => {
        stopTest();
        setTranslations([]);
        setLastTranslation(null);
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
        }
    };

    // Handle video end
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleEnded = () => {
            setIsPlaying(false);
            stopDetection();
        };

        video.addEventListener('ended', handleEnded);
        return () => video.removeEventListener('ended', handleEnded);
    }, [stopDetection]);

    return (
        <div className="p-6 bg-black/40 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3 mb-4">
                <Video className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">ASL Test Mode</h3>
                <span className="px-2 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                    DEV ONLY
                </span>
            </div>

            {/* File upload */}
            <div className="mb-4">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="video/*"
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm transition-colors"
                >
                    <Upload className="w-4 h-4" />
                    Upload ASL Video
                </button>
            </div>

            {/* Video/Canvas */}
            {videoSrc && (
                <div className="mb-4">
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                        {/* Hidden video source */}
                        <video
                            ref={videoRef}
                            src={videoSrc}
                            className="hidden"
                            playsInline
                            muted
                        />

                        {/* Canvas overlay with landmarks */}
                        <canvas
                            ref={canvasRef}
                            className="w-full h-full object-contain"
                        />

                        {/* Status indicators */}
                        <div className="absolute top-2 left-2 flex gap-2">
                            {isDetecting && (
                                <span className={`px-2 py-1 rounded text-xs ${handsDetected
                                        ? 'bg-emerald-500/30 text-emerald-300'
                                        : 'bg-white/20 text-white/60'
                                    }`}>
                                    {handsDetected ? '✋ Hands Detected' : '⏳ Waiting...'}
                                </span>
                            )}
                            {isTranslating && (
                                <span className="px-2 py-1 rounded text-xs bg-purple-500/30 text-purple-300 animate-pulse">
                                    🔄 Translating...
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-2 mt-3">
                        {!isPlaying ? (
                            <button
                                onClick={startTest}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-colors"
                            >
                                <Play className="w-4 h-4" />
                                Start Test
                            </button>
                        ) : (
                            <button
                                onClick={stopTest}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors"
                            >
                                <Pause className="w-4 h-4" />
                                Stop
                            </button>
                        )}
                        <button
                            onClick={resetTest}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset
                        </button>
                    </div>
                </div>
            )}

            {/* Translations */}
            {translations.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-bold text-white/70 mb-2">
                        Translations ({translations.length})
                    </h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                        {translations.map((t, i) => (
                            <div
                                key={i}
                                className={`px-3 py-2 rounded-lg text-sm ${i === 0
                                        ? 'bg-purple-500/20 text-purple-200 font-medium'
                                        : 'bg-white/5 text-white/60'
                                    }`}
                            >
                                {t.translation}
                                <span className="ml-2 text-xs opacity-50">
                                    ({t.confidence}, {t.latencyMs}ms)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                    {error}
                </div>
            )}

            {/* Tip */}
            <p className="mt-4 text-xs text-white/40">
                💡 Upload an MP4/WebM video of ASL signing to test the recognition pipeline.
                <br />
                Find test videos at: <a href="https://www.handspeak.com" target="_blank" rel="noopener noreferrer" className="underline">handspeak.com</a>
            </p>
        </div>
    );
}
