import { ASLTestMode } from '@/components/ASLTestMode';

export default function DevPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-2">
                    🛠️ Developer Tools
                </h1>
                <p className="text-white/60 mb-8">
                    Testing and debugging utilities for HealthBridge
                </p>

                <ASLTestMode />
            </div>
        </main>
    );
}
