'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, Loader2, AlertTriangle, Check, ScanLine } from 'lucide-react';
import { analyzeMedicalObject, MedicalObjectAnalysis } from '@/lib/gemini-3-service';

interface MedicalObjectScannerProps {
    onClose: () => void;
    onResult?: (analysis: MedicalObjectAnalysis) => void;
}

export function MedicalObjectScanner({ onClose, onResult }: MedicalObjectScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<MedicalObjectAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Start camera stream
    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment', width: 1280, height: 720 }
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                    setIsStreaming(true);
                }
            } catch (err) {
                console.error("Camera access error:", err);
                setError("Could not access camera. Please allow permissions.");
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const captureAndAnalyze = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || isAnalyzing) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            // Draw video frame to canvas
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("Could not get canvas context");

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Get base64 image
            const base64Image = canvas.toDataURL('image/jpeg', 0.8);

            // Call Gemini Vision service
            const result = await analyzeMedicalObject(base64Image);

            if (result) {
                setAnalysis(result);
                if (onResult) onResult(result);
            } else {
                setError("Could not identify object. Please try again.");
            }

        } catch (err) {
            console.error("Analysis error:", err);
            setError("Analysis failed. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    }, [isAnalyzing, onResult]);

    const resetScanner = () => {
        setAnalysis(null);
        setError(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg mx-4 bg-slate-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                            <ScanLine className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Medical Object Triage</h3>
                            <p className="text-xs text-blue-300">Powered by Gemini Vision</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Content */}
                <div className="relative flex-1 bg-black min-h-[300px] flex flex-col">

                    {/* Error State */}
                    {error && (
                        <div className="absolute top-4 left-4 right-4 z-20 p-3 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                            <p className="text-sm text-red-200">{error}</p>
                            <button onClick={resetScanner} className="ml-auto text-xs font-bold text-red-300 hover:text-white uppercase">Retry</button>
                        </div>
                    )}

                    {/* Camera View */}
                    {!analysis && (
                        <div className="relative flex-1 flex items-center justify-center overflow-hidden">
                            <video
                                ref={videoRef}
                                className="absolute inset-0 w-full h-full object-cover"
                                playsInline
                                muted
                            />
                            <canvas ref={canvasRef} className="hidden" />

                            {/* Scanning Overlay */}
                            <div className="absolute inset-0 border-2 border-blue-500/30 m-8 rounded-2xl pointer-events-none">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl -mt-1 -ml-1" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl -mt-1 -mr-1" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl -mb-1 -ml-1" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl -mb-1 -mr-1" />
                            </div>

                            {/* Analyzing Spinner */}
                            {isAnalyzing && (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-30">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse" />
                                        <Loader2 className="w-12 h-12 text-blue-400 animate-spin relative z-10" />
                                    </div>
                                    <p className="mt-4 text-blue-200 font-medium animate-pulse">Analyzing Object...</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Analysis Result */}
                    {analysis && (
                        <div className="flex-1 p-6 bg-slate-900 border-t border-white/5 animate-in slide-in-from-bottom-10 fade-in duration-300 overflow-y-auto">
                            {/* Trusted Badge */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className={`h-2 w-2 rounded-full ${analysis.confidence === 'high' ? 'bg-emerald-500' :
                                        analysis.confidence === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                                    }`} />
                                <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                                    {analysis.confidence} Confidence Match
                                </span>
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">{analysis.name}</h2>
                            <p className="text-white/70 leading-relaxed mb-6">{analysis.purpose}</p>

                            {/* Warnings */}
                            {analysis.warnings.length > 0 && (
                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
                                    <h4 className="text-amber-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Important Warnings
                                    </h4>
                                    <ul className="space-y-2">
                                        {analysis.warnings.map((warning, i) => (
                                            <li key={i} className="text-amber-200/80 text-sm flex gap-2">
                                                <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                                                {warning}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={resetScanner}
                                    className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                                >
                                    Scan Another
                                </button>
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/25 transition-all"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Footer Controls (Only when camera active) */}
                    {!analysis && (
                        <div className="p-6 bg-slate-900 border-t border-white/5 flex items-center justify-center gap-6">
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={captureAndAnalyze}
                                disabled={isAnalyzing || !isStreaming}
                                className="group relative w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center transition-all hover:border-white/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="absolute inset-0 rounded-full border border-white/50 scale-90 group-hover:scale-100 transition-transform" />
                                <div className="w-12 h-12 rounded-full bg-white group-hover:bg-blue-400 transition-colors shadow-lg" />
                                <Camera className="absolute w-6 h-6 text-slate-900 z-10" />
                            </button>

                            <div className="w-[43px]" /* Spacer for centering */ />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MedicalObjectScanner;
