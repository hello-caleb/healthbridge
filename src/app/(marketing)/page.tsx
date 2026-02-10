import Hero from "@/components/home/Hero";
import FeaturesGrid from "@/components/home/FeaturesGrid";
import TrustBar from "@/components/home/TrustBar";

export default function Home() {
    return (
        <main className="min-h-screen bg-[var(--bg-darkest)] selection:bg-[var(--brand-teal)]/30">
            <Hero />
            <TrustBar />
            <FeaturesGrid />
        </main>
    );
}
