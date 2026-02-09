'use client';

import React, { useState } from 'react';
import { X, Search, FileText, Loader2, MessageSquare } from 'lucide-react';
import { queryPatientHistory } from '@/lib/gemini-3-service';
import { MOCK_PATIENT_HISTORY } from '@/data/mock-patient-history';

interface PatientHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PatientHistoryModal({ isOpen, onClose }: PatientHistoryModalProps) {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;

        setIsLoading(true);
        setAnswer(null);

        try {
            const result = await queryPatientHistory(question, MOCK_PATIENT_HISTORY);
            setAnswer(result);
        } catch (error) {
            console.error("Search failed", error);
            setAnswer("Sorry, I encountered an error searching the records.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-[#0f1115] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Patient History Smart Search</h2>
                            <p className="text-xs text-white/50">Powered by Gemini 1.5 Pro</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Ask a question about the patient's history (e.g., 'Any allergies?')"
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                            autoFocus
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />

                        <button
                            type="submit"
                            disabled={isLoading || !question.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors disabled:opacity-50 disabled:bg-white/10"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ask Gemini'}
                        </button>
                    </form>

                    {/* Quick Suggestions */}
                    {!answer && !isLoading && (
                        <div className="flex flex-wrap gap-2">
                            {["List all medications", "Does he have diabetes?", "Recent surgeries?", "Family history of heart disease"].map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => setQuestion(q)}
                                    className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/60 hover:text-white transition-colors"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Answer Area */}
                    {answer && (
                        <div className="animate-in slide-in-from-bottom-5 fade-in duration-300">
                            <div className="flex gap-4">
                                <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 h-fit shrink-0 shadow-lg shadow-blue-500/20">
                                    <MessageSquare className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-white/90 leading-relaxed font-medium">
                                        {answer}
                                    </div>
                                    <p className="text-xs text-right text-white/30">Based on Mock Patient Records • AI generated</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading State Skeleton */}
                    {isLoading && (
                        <div className="flex gap-4 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 rounded bg-white/10" />
                                <div className="h-4 w-1/2 rounded bg-white/10" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer preview of data */}
                <div className="p-4 bg-black/20 border-t border-white/5 text-xs text-white/30 font-mono overflow-hidden whitespace-nowrap text-ellipsis">
                    Context: {MOCK_PATIENT_HISTORY.substring(0, 100)}...
                </div>
            </div>
        </div>
    );
}
