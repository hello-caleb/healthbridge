"use client";

import { useEffect, useState } from "react";
import PatientView from "./PatientView";
import DoctorView from "./DoctorView";
import { Play, RotateCcw } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

// --- Script Data ---
const scriptEvents = [
    {
        role: "patient",
        text: "I've been having chest pain for three days. It gets worse when I breathe deeply.",
        duration: 5000,
    },
    {
        role: "doctor",
        text: "Based on your symptoms and the EKG results, you have what we call pleuritic chest pain, likely caused by costochondritis — that's inflammation of the cartilage connecting your ribs to your breastbone.",
        jargon: [
            { term: "pleuritic chest pain", explanation: "pain when breathing" },
            { term: "costochondritis", explanation: "inflammation of rib cartilage" },
        ],
        duration: 8000,
    },
    {
        role: "simplified",
        text: "Your chest pain is caused by swelling in the cartilage that connects your ribs. It's called costochondritis. It's not your heart — it's the tissue around your ribs that's inflamed and hurting, especially when you breathe in.",
        duration: 6000,
    },
    {
        role: "patient",
        text: "Is it serious? Do I need surgery?",
        duration: 4000,
    },
    {
        role: "doctor",
        text: "No, this is a benign, self-limiting condition. We'll prescribe a course of NSAIDs — non-steroidal anti-inflammatory drugs — and recommend rest. You should see improvement within two to three weeks.",
        jargon: [
            { term: "benign", explanation: "not dangerous" },
            { term: "self-limiting", explanation: "heals on its own" },
            { term: "NSAIDs", explanation: "anti-inflammatory medicine like ibuprofen" },
        ],
        duration: 8000,
    },
    {
        role: "simplified",
        text: "Good news — this is not dangerous and it will heal on its own. We'll give you anti-inflammatory medicine (like ibuprofen) to help with the pain and swelling. You should feel better in 2–3 weeks. No surgery needed.",
        duration: 6000,
    },
    {
        role: "patient",
        text: "What about my blood pressure medication? Should I keep taking it?",
        duration: 4000,
    },
    {
        role: "doctor",
        text: "Yes, continue your current antihypertensive regimen — lisinopril 10mg daily. The costochondritis is unrelated to your hypertension management.",
        jargon: [
            { term: "antihypertensive regimen", explanation: "blood pressure medicine" },
            { term: "unrelated", explanation: "separate from" },
            { term: "hypertension management", explanation: "blood pressure" },
        ],
        duration: 7000,
    },
    {
        role: "simplified",
        text: "Yes, keep taking your blood pressure medicine (lisinopril, 10mg) every day as normal. Your chest pain issue is completely separate from your blood pressure.",
        duration: 5000,
    },
];

export default function DemoSimulation() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [stepIndex, setStepIndex] = useState(-1);

    // State for views
    const [currentPatientText, setCurrentPatientText] = useState("");
    const [currentDoctorText, setCurrentDoctorText] = useState("");
    const [currentSimplifiedText, setCurrentSimplifiedText] = useState("");
    const [highlightedTerms, setHighlightedTerms] = useState<Array<{ term: string, explanation: string }>>([]);
    const [turn, setTurn] = useState<"patient" | "doctor" | null>(null);

    // Auto-play on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsPlaying(true);
            setStepIndex(0);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Script Runner
    useEffect(() => {
        if (!isPlaying || stepIndex < 0) return;

        if (stepIndex >= scriptEvents.length) {
            // Loop gracefully
            const loopTimer = setTimeout(() => {
                resetSimulation();
                setIsPlaying(true);
                setStepIndex(0);
            }, 5000);
            return () => clearTimeout(loopTimer);
        }

        const event = scriptEvents[stepIndex];

        // Execute Event
        if (event.role === "patient") {
            setTurn("patient");
            setCurrentPatientText(event.text);
            if (stepIndex > 0) {
                setCurrentDoctorText("");
                setCurrentSimplifiedText("");
                setHighlightedTerms([]);
            }
        } else if (event.role === "doctor") {
            setTurn("doctor");
            setCurrentDoctorText(event.text);
            setHighlightedTerms(event.jargon || []);
        } else if (event.role === "simplified") {
            setCurrentSimplifiedText(event.text);
        }

        // Schedule next step
        const stepTimer = setTimeout(() => {
            setStepIndex((prev) => prev + 1);
        }, event.duration);

        return () => clearTimeout(stepTimer);
    }, [stepIndex, isPlaying]);

    const resetSimulation = () => {
        setIsPlaying(false);
        setStepIndex(-1);
        setCurrentPatientText("");
        setCurrentDoctorText("");
        setCurrentSimplifiedText("");
        setHighlightedTerms([]);
        setTurn(null);
    };

    return (
        <div className="relative w-full h-[calc(100vh-88px)] bg-[var(--bg-darkest)] text-white overflow-hidden font-sans selection:bg-brand-teal/30 flex items-center justify-center p-6 md:p-12">
            {/* --- Calm, Serene Looping Background --- */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Deep Teal Orb */}
                <div className="absolute top-[-10%] left-[10%] w-[40vw] h-[40vw] bg-brand-teal rounded-full blur-[120px] mix-blend-screen animate-float-slower opacity-20" />

                {/* Violet Orb */}
                <div className="absolute top-[20%] right-[10%] w-[35vw] h-[35vw] bg-brand-violet rounded-full blur-[100px] mix-blend-screen animate-float-slow opacity-20" style={{ animationDelay: "2s" }} />

                {/* Coral Orb (Bottom/Subtle) */}
                <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] bg-brand-coral rounded-full blur-[140px] mix-blend-screen animate-float opacity-10" style={{ animationDelay: "5s" }} />

                {/* Subtle Grain Overlay */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay"></div>
            </div>

            {/* --- Floating Glass Layout --- */}
            <div className="w-full max-w-[1600px] h-[85vh] grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 perspective-1000">
                {/* Left: Patient View Card */}
                <div className="h-full relative transform transition-transform hover:scale-[1.005] duration-700 ease-out">
                    <PatientView
                        isPatientTurn={turn === "patient"}
                        patientText={currentPatientText}
                        doctorSimplifiedText={currentSimplifiedText}
                        isDoctorSpeaking={turn === "doctor"}
                    />
                </div>

                {/* Right: Doctor View Card */}
                <div className="h-full relative transform transition-transform hover:scale-[1.005] duration-700 ease-out">
                    <DoctorView
                        isDoctorTurn={turn === "doctor"}
                        doctorText={currentDoctorText}
                        patientText={currentPatientText}
                        highlightedTerms={highlightedTerms}
                    />
                </div>
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-6 right-6 z-50 flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
                >
                    <Play className={`w-5 h-5 ${isPlaying ? "fill-white" : ""}`} />
                </button>
                <button
                    onClick={resetSimulation}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

