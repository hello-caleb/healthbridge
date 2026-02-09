'use client';

import { useState, useEffect } from 'react';
import { LiveKitRoom } from '@livekit/components-react';
import '@livekit/components-styles';
import { DoctorDashboard } from '@/components/DoctorDashboard';
import { DoctorOnboarding, useDoctorOnboarding } from '@/components/DoctorOnboarding';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const ROOM_NAME = 'healthbridge-session';
const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL || '';

/**
 * Doctor Page with Dashboard and Onboarding
 * 
 * Connects to LiveKit room and displays the DoctorDashboard for real-time
 * ASL translation viewing and patient communication.
 */
export default function DoctorPage() {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);

    // Onboarding state
    const {
        showOnboarding,
        triggerOnboarding,
        completeOnboarding
    } = useDoctorOnboarding();

    const fetchToken = async () => {
        try {
            setIsRetrying(true);
            const res = await fetch('/api/livekit-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room: ROOM_NAME,
                    identity: 'doctor-' + Math.random().toString(36).substring(7)
                }),
            });

            if (!res.ok) throw new Error('Failed to get token');

            const data = await res.json();
            setToken(data.token);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            setIsRetrying(false);
        }
    };

    useEffect(() => {
        fetchToken();
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto mb-4" />
                    <p className="text-white font-medium">Connecting to session...</p>
                    <p className="text-white/50 text-sm mt-1">Setting up secure video connection</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !token) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-xl font-bold text-white mb-2">Connection Failed</h1>
                    <p className="text-white/50 text-sm mb-6">
                        {error || 'Unable to establish connection. Please check your network and try again.'}
                    </p>
                    <button
                        onClick={fetchToken}
                        disabled={isRetrying}
                        className="flex items-center gap-2 px-6 py-3 mx-auto rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors disabled:opacity-50"
                    >
                        {isRetrying ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Retrying...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-5 h-5" />
                                Try Again
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <LiveKitRoom
            token={token}
            serverUrl={LIVEKIT_URL}
            connect={true}
            video={true}
            audio={true}
        >
            {/* Onboarding Tutorial */}
            {showOnboarding && (
                <DoctorOnboarding
                    onComplete={completeOnboarding}
                    onSkip={completeOnboarding}
                />
            )}

            {/* Main Dashboard */}
            <DoctorDashboard onRequestOnboarding={triggerOnboarding} />
        </LiveKitRoom>
    );
}
