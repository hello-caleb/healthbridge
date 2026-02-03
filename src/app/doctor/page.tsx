'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    LiveKitRoom,
    VideoTrack,
    useTracks,
    useLocalParticipant,
    ControlBar,
} from '@livekit/components-react';
import { Track, LocalVideoTrack } from 'livekit-client';
import '@livekit/components-styles';

const ROOM_NAME = 'healthbridge-session';
const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL || '';

function DoctorView() {
    const { localParticipant } = useLocalParticipant();
    const tracks = useTracks([Track.Source.Camera], { onlySubscribed: false });

    const localVideoTrack = tracks.find(
        (trackRef) => trackRef.participant.isLocal === true
    );

    return (
        <div className="flex h-screen flex-col bg-slate-900">
            <header className="bg-slate-800 px-6 py-4 border-b border-slate-700">
                <h1 className="text-2xl font-bold text-white">HealthBridge - Doctor View</h1>
                <p className="text-slate-400">Your video is being shared with the patient</p>
            </header>

            <main className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-600">
                    {localVideoTrack ? (
                        <VideoTrack
                            trackRef={localVideoTrack}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                            <p>Enable your camera to start sharing</p>
                        </div>
                    )}
                </div>
            </main>

            <footer className="bg-slate-800 px-6 py-4 border-t border-slate-700">
                <ControlBar variation="minimal" />
            </footer>
        </div>
    );
}

export default function DoctorPage() {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function getToken() {
            try {
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
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }

        getToken();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-900">
                <div className="text-white">Connecting...</div>
            </div>
        );
    }

    if (error || !token) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-900">
                <div className="text-red-400">Error: {error || 'Failed to connect'}</div>
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
            <DoctorView />
        </LiveKitRoom>
    );
}
