"use client";

import { Mic, Brain, Stethoscope, ChevronRight } from "lucide-react";
import TypingText from "./TypingText";

interface DoctorViewProps {
    isDoctorTurn: boolean;
    doctorText: string;
    patientText: string;
    highlightedTerms: Array<{ term: string; explanation: string }>;
}

export default function DoctorView({
    isDoctorTurn,
    doctorText,
    patientText,
    highlightedTerms = [],
}: DoctorViewProps) {
    return (
        <div className="flex flex-col h-full glass-panel rounded-[2.5rem] relative overflow-hidden shadow-2xl transition-all duration-500">
            {/* Header / Status Pill */}
            <div className="flex items-center justify-between px-6 py-3 mx-6 mt-6 bg-white/[0.05] backdrop-blur-md border border-white/10 rounded-full z-20 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className={`w-2.5 h-2.5 rounded-full ${isDoctorTurn ? "bg-[var(--brand-violet)] animate-pulse shadow-[0_0_10px_rgba(167,139,250,0.5)]" : "bg-white/20"}`} />
                        {isDoctorTurn && <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-[var(--brand-violet)] animate-ping opacity-50" />}
                    </div>
                    <span className="text-sm font-medium text-white/90 tracking-wide">Doctor View</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-violet)]/10 border border-[var(--brand-violet)]/20">
                    <Brain className="w-3 h-3 text-[var(--brand-violet)]" />
                    <span className="text-[10px] uppercase font-mono text-[var(--brand-violet)] tracking-wider">Gemini 3 Pro</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col p-8 gap-6 overflow-y-auto w-full">

                {/* 1. Patient Transcript Feed */}
                <div className="flex-1 min-h-[200px] rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#0a0a0f00] to-transparent pointer-events-none" />

                    <div className="flex flex-col gap-4 mt-auto justify-end h-full">
                        {patientText && (
                            <div className="bg-[var(--brand-teal)]/10 border border-[var(--brand-teal)]/20 rounded-[1.5rem] rounded-tl-sm p-6 self-start max-w-[85%] animate-fade-in-up shadow-lg">
                                <span className="text-[10px] font-bold text-[var(--brand-teal)] uppercase tracking-widest mb-2 block">Patient (ASL)</span>
                                <p className="text-white/90 font-light text-lg leading-relaxed">{patientText}</p>
                            </div>
                        )}
                        {!patientText && (
                            <div className="flex items-center justify-center h-full opacity-10">
                                <span className="text-sm font-light tracking-widest uppercase">Waiting for patient...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Doctor's Active Speech & Analysis */}
                <div className={`rounded-[2rem] p-8 border transition-all duration-700 min-h-[240px] flex flex-col ${isDoctorTurn ? "bg-[var(--brand-violet)]/10 border-[var(--brand-violet)]/20 shadow-[0_0_40px_-10px_rgba(167,139,250,0.15)]" : "bg-white/[0.02] border-white/5"}`}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-full ${isDoctorTurn ? "bg-[var(--brand-violet)]/20 text-[var(--brand-violet)]" : "bg-white/5 text-white/30"}`}>
                                <Mic className="w-5 h-5" />
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-widest ${isDoctorTurn ? "text-[var(--brand-violet)]" : "text-white/20"}`}>
                                Live Transcription
                            </span>
                        </div>
                        {isDoctorTurn && (
                            <span className="text-[10px] bg-[var(--brand-violet)]/10 border border-[var(--brand-violet)]/20 text-[var(--brand-violet)] px-3 py-1 rounded-full font-mono animate-pulse tracking-wide">
                                Jargon Detected
                            </span>
                        )}
                    </div>

                    <div className="text-xl md:text-2xl font-light text-white/90 leading-relaxed mb-8 tracking-tight">
                        {doctorText ? (
                            <TypingText text={doctorText} speed={30} key={doctorText} cursorColor="bg-[var(--brand-violet)]" />
                        ) : (
                            <span className="text-white/10 font-light">Listening...</span>
                        )}
                    </div>

                    {/* Jargon Analysis / Reason Sidebar Simulation */}
                    <div className="mt-auto border-t border-white/5 pt-6">
                        <div className="flex items-center gap-2 mb-4 text-[10px] uppercase tracking-widest text-white/30">
                            <Stethoscope className="w-3 h-3" />
                            <span>Clinical Reasoning Logic</span>
                        </div>
                        <div className="space-y-3">
                            {highlightedTerms.map((term, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white/[0.03] border border-white/5 px-4 py-3 rounded-xl text-sm animate-fade-in-left hover:bg-white/[0.05] transition-colors" style={{ animationDelay: `${i * 1.5}s` }}>
                                    <span className="text-[var(--brand-violet)] font-medium">{term.term}</span>
                                    <ChevronRight className="w-3 h-3 text-white/20" />
                                    <span className="text-[var(--brand-teal)] font-medium">{term.explanation}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 text-center border-t border-white/5">
                <p className="text-[10px] text-white/20 uppercase tracking-widest">
                    Clinical Decision Support System • Gemini 1.5 Pro
                </p>
            </div>
        </div>
    );
}

