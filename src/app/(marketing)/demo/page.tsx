import DemoSimulation from "@/components/demo/DemoSimulation";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "HealthBridge | Live Demo Simulation",
    description: "Simulated doctor-patient interaction showcasing real-time ASL translation and jargon simplification.",
};

export default function DemoPage() {
    return (
        <main className="min-h-screen bg-[#0a0a0f] text-white">
            <DemoSimulation />
        </main>
    );
}
