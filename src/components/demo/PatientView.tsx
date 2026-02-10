"use client";

import { Hand, Activity, Zap } from "lucide-react";
import TypingText from "./TypingText";

interface PatientViewProps {
    isPatientTurn: boolean;
    patientText: string;
    doctorSimplifiedText: string;
    isDoctorSpeaking: boolean;
}

export default function PatientView({
    isPatientTurn,
    patientText,
    doctorSimplifiedText,
    isDoctorSpeaking,
}: PatientViewProps) {
    return (
        <div className="flex flex-col h-full glass-panel rounded-[2.5rem] relative overflow-hidden shadow-2xl transition-all duration-500">
            {/* Header / Status Pill */}
            <div className="flex items-center justify-between px-6 py-3 mx-6 mt-6 bg-white/[0.05] backdrop-blur-md border border-white/10 rounded-full z-20 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className={`w-2.5 h-2.5 rounded-full ${isPatientTurn ? "bg-[var(--brand-teal)] animate-pulse shadow-[0_0_10px_rgba(8,145,178,0.5)]" : "bg-white/20"}`} />
                        {isPatientTurn && <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-[var(--brand-teal)] animate-ping opacity-50" />}
                    </div>
                    <span className="text-sm font-medium text-white/90 tracking-wide">Patient View</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-teal)]/10 border border-[var(--brand-teal)]/20">
                    <Zap className="w-3 h-3 text-[var(--brand-teal)]" />
                    <span className="text-[10px] uppercase font-mono text-[var(--brand-teal)] tracking-wider">Gemini 3 Flash</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col p-8 gap-6 overflow-y-auto w-full">

                {/* 1. ASL Capture Area (Video Placeholder) */}
                <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/5 bg-black/40 shadow-inner group transition-all duration-500">
                    {/* Simulated Camera Feed */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`relative w-28 h-28 rounded-full bg-white/5 flex items-center justify-center transition-all duration-700 ${isPatientTurn ? "scale-105 bg-[var(--brand-teal)]/5" : "grayscale opacity-50"}`}>
                            <Hand className={`w-12 h-12 transition-colors duration-500 ${isPatientTurn ? "text-[var(--brand-teal)] drop-shadow-[0_0_15px_rgba(8,145,178,0.4)]" : "text-white/10"}`} />
                            {isPatientTurn && (
                                <>
                                    <div className="absolute inset-0 border border-[var(--brand-teal)]/20 rounded-full animate-[spin_4s_linear_infinite]" />
                                    <div className="absolute inset-[-20px] border border-[var(--brand-teal)]/5 rounded-full animate-[ping_3s_ease-out_infinite]" />
                                </>
                            )}
                        </div>
                    </div>

                    {/* MediaPipe Overlay Simulation - Subtler */}
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        {isPatientTurn && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-[var(--brand-teal)]/30 rounded-full animate-pulse" />}
                    </div>

                    <div className="absolute bottom-4 left-4 flex gap-2">
                        <span className="px-2 py-1 rounded bg-black/60 backdrop-blur text-[10px] text-white/60 font-mono">
                            Lat: 12ms | FPS: 60
                        </span>
                    </div>
                </div>

                {/* 2. Real-time Transcript (What the patient is saying) */}
                <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-8 min-h-[140px] flex flex-col transition-all duration-500 hover:bg-white/[0.05]">
                    <span className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4 block pl-1">
                        Live Transcription
                    </span>
                    <div className="text-2xl font-light text-white/90 leading-relaxed tracking-tight">
                        {patientText ? (
                            <TypingText text={patientText} speed={40} key={patientText} cursorColor="bg-[var(--brand-teal)]" />
                        ) : (
                            <span className="text-white/10 font-light">Waiting for sign input...</span>
                        )}
                    </div>
                </div>

                {/* 3. Doctor's Simplified Response */}
                <div className={`flex-1 rounded-[2rem] p-8 border transition-all duration-700 flex flex-col ${isDoctorSpeaking ? "bg-[var(--brand-violet)]/10 border-[var(--brand-violet)]/20 shadow-[0_0_40px_-10px_rgba(167,139,250,0.15)]" : "bg-white/[0.02] border-white/5"}`}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`p-2.5 rounded-full ${isDoctorSpeaking ? "bg-[var(--brand-violet)]/20 text-[var(--brand-violet)]" : "bg-white/5 text-white/30"}`}>
                            <Activity className="w-5 h-5" />
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-widest ${isDoctorSpeaking ? "text-[var(--brand-violet)]" : "text-white/20"}`}>
                            Doctor (Simplified)
                        </span>
                    </div>

                    <div className="text-lg text-white/80 leading-relaxed">
                        {doctorSimplifiedText ? (
                            <TypingText text={doctorSimplifiedText} speed={25} key={doctorSimplifiedText} cursorColor="bg-[var(--brand-violet)]" />
                        ) : (
                            <span className="text-white/10 italic">Doctor is listening...</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 text-center border-t border-white/5">
                <p className="text-[10px] text-white/20 uppercase tracking-widest">
                    Secure Connection • HIPAA Compliant • Gemini 2.5 Flash
                </p>
            </div>
        </div>
    );
}

