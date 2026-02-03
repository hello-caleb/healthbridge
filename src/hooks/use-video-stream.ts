'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export function useVideoStream() {
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startVideo = useCallback(async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });

            streamRef.current = stream;
            setIsActive(true); // This triggers the video element to render
        } catch (err: any) {
            console.error('Failed to start video:', err);
            setError(err.message || 'Failed to access camera');
        }
    }, []);

    // Effect to attach stream to video element once it mounts
    useEffect(() => {
        if (isActive && streamRef.current && videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(console.error);
        }
    }, [isActive]);

    const stopVideo = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setIsActive(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return {
        videoRef,
        isActive,
        error,
        startVideo,
        stopVideo
    };
}
