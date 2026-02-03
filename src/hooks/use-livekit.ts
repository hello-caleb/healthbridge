'use client';

import { useState, useCallback } from 'react';

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL || '';

export function useLiveKit() {
    const [token, setToken] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getToken = useCallback(async (room: string, identity: string) => {
        setIsConnecting(true);
        setError(null);

        try {
            const res = await fetch('/api/livekit-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ room, identity }),
            });

            if (!res.ok) {
                throw new Error('Failed to get LiveKit token');
            }

            const data = await res.json();
            setToken(data.token);
            return data.token;
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setIsConnecting(false);
        }
    }, []);

    const disconnect = useCallback(() => {
        setToken(null);
    }, []);

    return {
        token,
        serverUrl: LIVEKIT_URL,
        isConnecting,
        error,
        getToken,
        disconnect,
    };
}
