'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Video, Mic, Power, MicOff, ExternalLink, RefreshCw, Wifi, WifiOff, Settings, Shield, Hand, Volume2 } from 'lucide-react';
import { useGeminiClient, MedicalTerm } from '@/hooks/use-gemini-client';
import { useVideoStream } from '@/hooks/use-video-stream';
import { useSpeakerDiarization, getSpeakerStyles } from '@/hooks/use-speaker-diarization';
import { useSessionTimeout } from '@/hooks/use-session-timeout';
import { DoctorVideoRoom } from '@/components/DoctorVideoRoom';
import { SessionTimeoutModal } from '@/components/SessionTimeoutModal';
import { MedicalTermsCarousel } from '@/components/MedicalTermsCarousel';
import { ASLInput } from '@/components/ASLInput';
import { ASLTranslationResult } from '@/lib/asl-translation-service';

function CinematicContent() {
    const [apiKey] = useState<string>(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
    const { isConnected, isRecording, isReconnecting, reconnectAttempts, transcript, medicalTerms, error, connect, disconnect, startAudio } = useGeminiClient({ apiKey });
    const { videoRef, isActive: isVideoActive, startVideo, stopVideo } = useVideoStream();
    const speakerSegments = useSpeakerDiarization(transcript);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Input mode: 'audio' (speech) or 'asl' (sign language)
    const [inputMode, setInputMode] = useState<'audio' | 'asl'>('audio');

    // ASL translation state
    const [aslTranslations, setAslTranslations] = useState<ASLTranslationResult[]>([]);

    // Handle ASL translation
    const handleASLTranslation = (result: ASLTranslationResult) => {
        setAslTranslations(prev => [result, ...prev].slice(0, 20));
    };

    // Session timeout management
    const { showWarning, timeRemaining, dismissWarning } = useSessionTimeout({
        onDisconnect: disconnect,
        isActive: isConnected,
    });

    // LiveKit state
    const [livekitToken, setLivekitToken] = useState<string | null>(null);
    const [isLivekitConnecting, setIsLivekitConnecting] = useState(false);
    const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL || '';
    const ROOM_NAME = 'healthbridge-session';

    // Auto-scroll transcription
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcript]);

    const handleToggleConnect = () => {
        if (isConnected) {
            disconnect();
        } else {
            connect();
        }
    };

    const joinLiveKitRoom = async () => {
        setIsLivekitConnecting(true);
        try {
            const res = await fetch('/api/livekit-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ room: ROOM_NAME, identity: 'patient-' + Date.now() }),
            });
            if (res.ok) {
                const data = await res.json();
                setLivekitToken(data.token);
            }
        } catch (e) {
            console.error('LiveKit token error:', e);
        } finally {
            setIsLivekitConnecting(false);
        }
    };

    // Transform medical terms for carousel
    const carouselTerms = medicalTerms.map((term: MedicalTerm) => ({
        term: term.term,
        definition: term.definition,
        timestamp: term.timestamp,
    }));

    return (
        <>
            <SessionTimeoutModal
                isOpen={showWarning}
                timeRemaining={timeRemaining}
                onContinue={dismissWarning}
            />

            <div className="h-screen w-screen overflow-hidden bg-[#0a0a0a] text-white font-sans flex flex-col">
                {/* Organic background shapes */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-emerald-900/20 to-transparent blur-3xl animate-float-slow" />
                    <div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-amber-900/10 to-transparent blur-3xl animate-float-slower" />
                    <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-teal-900/15 to-transparent blur-3xl animate-float" />
                </div>

                {/* Reconnection Banner */}
                {isReconnecting && (
                    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/90 backdrop-blur-sm text-white py-3 px-4 text-center font-semibold flex items-center justify-center gap-2 animate-pulse">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Connection lost. Reconnecting... (Attempt {reconnectAttempts}/3)
                    </div>
                )}

                {/* Top Navigation Bar */}
                <header className={`relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/5 ${isReconnecting ? 'mt-12' : ''}`}>
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold tracking-tight">
                            <span className="text-white">Health</span>
                            <span className="text-emerald-400">Bridge</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Input Mode Toggle */}
                        <div className="flex items-center rounded-full bg-white/5 border border-white/10 p-1">
                            <button
                                onClick={() => setInputMode('audio')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                                    inputMode === 'audio'
                                        ? 'bg-emerald-500 text-white'
                                        : 'text-white/50 hover:text-white/70'
                                }`}
                            >
                                <Volume2 className="h-3.5 w-3.5" />
                                Audio
                            </button>
                            <button
                                onClick={() => setInputMode('asl')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                                    inputMode === 'asl'
                                        ? 'bg-purple-500 text-white'
                                        : 'text-white/50 hover:text-white/70'
                                }`}
                            >
                                <Hand className="h-3.5 w-3.5" />
                                ASL
                            </button>
                        </div>

                        {/* Connection status */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isConnected
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-red-500/10 border-red-500/30 text-red-400'
                            }`}>
                            {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                            <span className="text-xs font-bold uppercase tracking-wider">
                                {isConnected ? 'Connected' : 'Offline'}
                            </span>
                        </div>

                        {/* Security indicator */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50">
                            <Shield className="h-4 w-4" />
                            <span className="text-xs font-medium">Secure</span>
                        </div>

                        {/* Settings */}
                        <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                            <Settings className="h-4 w-4 text-white/50" />
                        </button>

                        {/* Connect/Disconnect */}
                        <button
                            onClick={handleToggleConnect}
                            className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm transition-all ${isConnected
                                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                }`}
                        >
                            <Power className="h-4 w-4" />
                            {isConnected ? 'End' : 'Start'}
                        </button>
                    </div>
                </header>

                {/* Error Banner */}
                {error && (
                    <div className="relative z-20 mx-6 mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                        <p className="text-sm text-red-400 font-medium">{error}</p>
                    </div>
                )}

                {/* Main Content */}
                <main className="relative z-10 flex-1 flex gap-4 p-4 min-h-0">
                    {/* Video Area (Left - 65%) */}
                    <section className="relative flex-[2] flex flex-col min-w-0">
                        {/* Main Video (Doctor) */}
                        <div className="relative flex-1 rounded-3xl overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
                            {livekitToken ? (
                                <DoctorVideoRoom
                                    token={livekitToken}
                                    serverUrl={LIVEKIT_URL}
                                    onDisconnect={() => setLivekitToken(null)}
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                            <Video className="h-10 w-10 text-white/20" />
                                        </div>
                                        <p className="text-lg font-medium text-white/50 mb-2">Doctor Feed</p>
                                        <p className="text-sm text-white/30 mb-4">Connect to see doctor video</p>
                                        <button
                                            onClick={joinLiveKitRoom}
                                            disabled={isLivekitConnecting}
                                            className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors disabled:opacity-50"
                                        >
                                            {isLivekitConnecting ? 'Connecting...' : 'Join Video Room'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Doctor label */}
                            <div className="absolute top-4 left-4 flex items-center gap-2">
                                <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                                    <span className="text-sm font-bold text-white">Dr. Smith</span>
                                    <span className="text-xs text-white/50 ml-2">Primary Care</span>
                                </div>
                                <a
                                    href="/doctor"
                                    target="_blank"
                                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/50 hover:text-white/70 transition-colors"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    Doctor View
                                </a>
                            </div>

                            {/* Picture-in-Picture (Patient) - Audio Mode */}
                            {inputMode === 'audio' && (
                                <div className="absolute bottom-4 right-4 w-48 h-36 rounded-2xl overflow-hidden bg-black/50 border border-white/10 shadow-2xl">
                                    {isVideoActive ? (
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
                                            <Mic className="h-8 w-8 text-white/20" />
                                        </div>
                                    )}

                                    {/* PiP Label */}
                                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm">
                                        <span className="text-xs font-bold text-white/80">You</span>
                                    </div>

                                    {/* PiP Controls */}
                                    {isConnected && (
                                        <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                                            <button
                                                onClick={startAudio}
                                                disabled={isRecording}
                                                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${isRecording
                                                        ? 'bg-red-500/30 text-red-400'
                                                        : 'bg-white/10 hover:bg-white/20 text-white/70'
                                                    }`}
                                            >
                                                {isRecording ? <Mic className="h-3 w-3 animate-pulse" /> : <MicOff className="h-3 w-3" />}
                                            </button>
                                            <button
                                                onClick={isVideoActive ? stopVideo : startVideo}
                                                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${isVideoActive
                                                        ? 'bg-emerald-500/30 text-emerald-400'
                                                        : 'bg-white/10 hover:bg-white/20 text-white/70'
                                                    }`}
                                            >
                                                <Video className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ASL Input Panel - ASL Mode */}
                            {inputMode === 'asl' && (
                                <div className="absolute bottom-4 right-4 w-72 h-56 rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl bg-black/30 backdrop-blur-sm">
                                    <ASLInput
                                        onTranslation={handleASLTranslation}
                                        isEnabled={inputMode === 'asl'}
                                    />
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Live Transcription (Right - 35%) */}
                    <aside className="flex-1 flex flex-col min-w-[320px] max-w-[400px]">
                        <div className="flex-1 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm flex flex-col overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <h2 className="text-sm font-bold uppercase tracking-widest text-white/50">
                                        Live Transcription
                                    </h2>
                                </div>
                                {isRecording && (
                                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold animate-pulse">
                                        LISTENING
                                    </span>
                                )}
                            </div>

                            {/* Transcription content */}
                            <div
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-5 space-y-4"
                            >
                                {speakerSegments.length === 0 && aslTranslations.length === 0 ? (
                                    <p className="text-center text-white/20 italic mt-8">
                                        {inputMode === 'asl'
                                            ? 'Sign in ASL - translations will appear here...'
                                            : 'Transcription will appear here...'}
                                    </p>
                                ) : (
                                    <>
                                        {/* Audio transcription segments */}
                                        {speakerSegments.map((segment, index) => {
                                            const isDoctor = segment.speaker === 'doctor';
                                            const isNewest = index === speakerSegments.length - 1;

                                            return (
                                                <div
                                                    key={`speech-${index}`}
                                                    className={`animate-in fade-in slide-in-from-bottom duration-300`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-xs font-bold uppercase tracking-wider ${isDoctor ? 'text-blue-400' : 'text-emerald-400'
                                                            }`}>
                                                            {isDoctor ? 'Doctor' : 'Patient'}
                                                        </span>
                                                        {segment.timestamp && (
                                                            <span className="text-xs text-white/30">{segment.timestamp}</span>
                                                        )}
                                                    </div>
                                                    <p className={`text-lg leading-relaxed font-medium transition-all duration-500 ${isNewest
                                                            ? 'text-white illuminated-text'
                                                            : 'text-white/60'
                                                        }`}>
                                                        {segment.text}
                                                    </p>
                                                </div>
                                            );
                                        })}

                                        {/* ASL translation segments */}
                                        {aslTranslations.map((translation, index) => {
                                            const isNewest = index === 0;

                                            return (
                                                <div
                                                    key={`asl-${index}`}
                                                    className={`animate-in fade-in slide-in-from-bottom duration-300 border-l-2 border-purple-500/50 pl-3`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Hand className="w-3 h-3 text-purple-400" />
                                                        <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                                                            Patient (ASL)
                                                        </span>
                                                        <span className="text-xs text-white/30">{translation.timestamp}</span>
                                                        {translation.confidence === 'high' && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                                                                ✓
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className={`text-lg leading-relaxed font-medium transition-all duration-500 ${isNewest
                                                            ? 'text-white illuminated-text'
                                                            : 'text-white/60'
                                                        }`}>
                                                        {translation.translation}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
                            </div>
                        </div>
                    </aside>
                </main>

                {/* Medical Terms Carousel (Bottom) */}
                <footer className="relative z-10 border-t border-white/5 bg-gradient-to-t from-black/50 to-transparent py-4">
                    <MedicalTermsCarousel terms={carouselTerms} />
                </footer>
            </div>
        </>
    );
}

export default function CinematicVideoRoom() {
    return <CinematicContent />;
}
