'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Video, Mic, Globe, Info, Power, Mic as MicIcon, MicOff } from 'lucide-react';
import { useGeminiClient, MedicalTerm } from '@/hooks/use-gemini-client';
import { useVideoStream } from '@/hooks/use-video-stream';

export default function Dashboard() {
    const [apiKey, setApiKey] = useState<string>(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
    const { isConnected, isRecording, transcript, medicalTerms, error, connect, disconnect, startAudio } = useGeminiClient({ apiKey });
    const { videoRef, isActive: isVideoActive, startVideo, stopVideo } = useVideoStream();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [captionSize, setCaptionSize] = useState<'sm' | 'md' | 'lg'>('md');

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

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 font-sans">
            {/* Header */}
            <header className="mb-4 flex flex-col gap-4 border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-extrabold tracking-tight text-blue-800">HealthBridge</h1>
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 border ${isConnected ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                            <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-600' : 'bg-red-600 animate-pulse'}`} />
                            <span className="text-sm font-bold">{isConnected ? 'Connected' : 'Disconnected'}</span>
                        </div>

                        <input
                            type="password"
                            placeholder="API Key"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none placeholder:text-slate-400"
                            suppressHydrationWarning
                        />

                        <button
                            onClick={handleToggleConnect}
                            className={`flex items-center gap-2 rounded-full px-6 py-2 font-bold shadow-sm transition-all text-white ${isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-700 hover:bg-blue-800'}`}
                        >
                            <Power className="h-4 w-4" />
                            {isConnected ? 'End Session' : 'Start Session'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="rounded-lg bg-red-50 border-l-4 border-red-500 p-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700 font-medium">
                                    {error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Grid */}
            <main className="grid h-[calc(100vh-100px)] grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Video Feeds Area (Left/Center) */}
                <section className="relative col-span-1 flex flex-col gap-6 lg:col-span-9 lg:h-full">
                    {/* Video Grid */}
                    <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Doctor Feed */}
                        <div className="relative flex min-h-[300px] items-center justify-center rounded-3xl bg-white border-2 border-slate-200 shadow-sm overflow-hidden">
                            {/* Placeholder for real video */}
                            <div className="text-center text-slate-400">
                                <Video className="mx-auto mb-3 h-16 w-16 opacity-20" />
                                <span className="text-xl font-medium text-slate-500">Doctor Feed</span>
                                <p className="text-sm">Waiting for connection...</p>
                            </div>
                            <div className="absolute top-4 left-4 rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-bold text-blue-900 shadow-sm">
                                Doctor
                            </div>
                        </div>

                        {/* Patient Feed */}
                        <div className="relative flex min-h-[300px] items-center justify-center rounded-3xl bg-white border-2 border-slate-200 shadow-sm overflow-hidden">
                            {/* Video Preview or Placeholder */}
                            {isVideoActive ? (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-center text-slate-400">
                                    <Mic className="mx-auto mb-3 h-16 w-16 opacity-20" />
                                    <span className="text-xl font-medium text-slate-500">Patient Feed</span>
                                    <p className="text-sm">Local Microphone & Camera</p>
                                </div>
                            )}

                            <div className="absolute top-4 left-4 flex items-center gap-2">
                                <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-900 shadow-sm border border-slate-200">You</div>
                                {isConnected && (
                                    <>
                                        <button
                                            onClick={startAudio}
                                            disabled={isRecording}
                                            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-bold shadow-sm border ${isRecording ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                                        >
                                            {isRecording ? <MicIcon className="h-4 w-4 animate-pulse fill-current" /> : <MicOff className="h-4 w-4" />}
                                            {isRecording ? 'Mic Active' : 'Enable Mic'}
                                        </button>
                                        <button
                                            onClick={isVideoActive ? stopVideo : startVideo}
                                            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-bold shadow-sm border ${isVideoActive ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                                        >
                                            <Video className="h-4 w-4" />
                                            {isVideoActive ? 'Camera On' : 'Enable Camera'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Live Captions Overlay */}
                    <div className="min-h-[200px] shrink-0 rounded-3xl bg-white p-6 border-2 border-slate-200 shadow-md flex flex-col">
                        <h2 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-slate-500 flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                            <span className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                Live Captions
                            </span>
                            {isRecording && <span className="text-red-600 text-xs font-bold animate-pulse px-2 bg-red-50 rounded">LISTENING</span>}
                            <button
                                onClick={() => setCaptionSize(s => s === 'sm' ? 'md' : s === 'md' ? 'lg' : 'sm')}
                                className="text-xs font-bold px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 text-slate-600"
                            >
                                {captionSize === 'sm' ? 'A' : captionSize === 'md' ? 'A+' : 'A++'}
                            </button>
                        </h2>
                        <div ref={scrollRef} className="flex-1 overflow-y-auto max-h-[250px] p-2">
                            <p className={`leading-relaxed text-slate-800 font-semibold whitespace-pre-wrap font-sans ${captionSize === 'sm' ? 'text-base lg:text-lg' : captionSize === 'md' ? 'text-xl lg:text-2xl' : 'text-2xl lg:text-4xl'}`} aria-live="polite">
                                {transcript || <span className="text-slate-300 italic">Captions will appear here...</span>}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Side Panel: Jargon & Insights (Right) */}
                <aside className="col-span-1 flex flex-col rounded-3xl bg-white p-6 lg:col-span-3 border-2 border-slate-200 shadow-sm">
                    <div className="mb-6 flex items-center gap-3 border-b-2 border-slate-100 pb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                            <Info className="h-6 w-6" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Clarifications</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {medicalTerms.length === 0 ? (
                            <div className="text-center text-slate-400 mt-10">
                                <p className="text-sm">No complex terms detected yet.</p>
                            </div>
                        ) : (
                            medicalTerms.map((item, index) => (
                                <div key={index} className="rounded-2xl bg-slate-50 p-4 border border-slate-100 hover:border-blue-200 transition-colors animate-in slide-in-from-right fade-in duration-300">
                                    <div className="mb-2 flex items-baseline justify-between">
                                        <span className="font-bold text-blue-700 text-lg capitalize">{item.term}</span>
                                        <span className="text-xs font-bold text-slate-400">{item.timestamp}</span>
                                    </div>
                                    <p className="text-base font-medium text-slate-700 leading-snug">
                                        {item.definition}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </aside>
            </main>
        </div>
    );
}
