'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSessionTimeoutProps {
    warningTimeout?: number;  // Time until warning appears (ms)
    disconnectTimeout?: number;  // Time until auto-disconnect (ms)
    onDisconnect: () => void;
    isActive: boolean;  // Whether to track activity (only when connected)
}

interface UseSessionTimeoutResult {
    showWarning: boolean;
    timeRemaining: number;  // Seconds until disconnect
    resetActivity: () => void;
    dismissWarning: () => void;
}

/**
 * Hook to manage session timeout with warning
 * - 15 minutes: Show warning modal
 * - 20 minutes: Auto-disconnect
 */
export function useSessionTimeout({
    warningTimeout = 15 * 60 * 1000,  // 15 minutes
    disconnectTimeout = 20 * 60 * 1000,  // 20 minutes
    onDisconnect,
    isActive
}: UseSessionTimeoutProps): UseSessionTimeoutResult {
    const [showWarning, setShowWarning] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);

    const lastActivityRef = useRef(Date.now());
    const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
    const disconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const resetActivity = useCallback(() => {
        lastActivityRef.current = Date.now();
        setShowWarning(false);

        // Clear existing timers
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);

        if (!isActive) return;

        // Set new warning timer
        warningTimerRef.current = setTimeout(() => {
            setShowWarning(true);
            const disconnectAt = Date.now() + (disconnectTimeout - warningTimeout);
            setTimeRemaining(Math.ceil((disconnectTimeout - warningTimeout) / 1000));

            // Start countdown
            countdownRef.current = setInterval(() => {
                const remaining = Math.ceil((disconnectAt - Date.now()) / 1000);
                if (remaining <= 0) {
                    if (countdownRef.current) clearInterval(countdownRef.current);
                    onDisconnect();
                    setShowWarning(false);
                } else {
                    setTimeRemaining(remaining);
                }
            }, 1000);

            // Set disconnect timer
            disconnectTimerRef.current = setTimeout(() => {
                onDisconnect();
                setShowWarning(false);
            }, disconnectTimeout - warningTimeout);
        }, warningTimeout);
    }, [isActive, warningTimeout, disconnectTimeout, onDisconnect]);

    const dismissWarning = useCallback(() => {
        // User acknowledged warning - reset all timers
        resetActivity();
    }, [resetActivity]);

    // Track user activity
    useEffect(() => {
        if (!isActive) {
            // Clear timers when not active
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
            if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
            setShowWarning(false);
            return;
        }

        const handleActivity = () => {
            // Only reset if not currently showing warning
            if (!showWarning) {
                resetActivity();
            }
        };

        // Track various user activities
        const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];
        events.forEach(event => {
            document.addEventListener(event, handleActivity, { passive: true });
        });

        // Initial timer setup
        resetActivity();

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleActivity);
            });
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
            if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [isActive, showWarning, resetActivity]);

    return {
        showWarning,
        timeRemaining,
        resetActivity,
        dismissWarning
    };
}
