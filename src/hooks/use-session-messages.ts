'use client';

/**
 * useSessionMessages Hook
 * 
 * React hook for LiveKit data channel messaging between doctor and patient views.
 * Handles sending/receiving translations, signing status, and repeat requests.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDataChannel } from '@livekit/components-react';
import {
    SessionMessage,
    RepeatRequest,
    TranslationPayload,
    SigningStatusPayload,
    createRepeatRequest,
    createTranslationMessage,
    createSigningStatusMessage,
    createUnderstoodMessage,
    serializeMessage,
    deserializeMessage,
    addToHistory,
    getConversationHistory,
    ConversationEntry,
    initializeSession,
} from '@/lib/session-communication';
import { SignState } from '@/hooks/use-hand-landmarker';
import { ConfidenceResult } from '@/lib/confidence-scorer';
import { ASLTranslationResult } from '@/lib/asl-translation-service';
import { playNotificationForConfidence } from '@/lib/notification-sounds';

// ============================================================================
// Types
// ============================================================================

export interface UseSessionMessagesOptions {
    role: 'doctor' | 'patient';
    onTranslation?: (payload: TranslationPayload) => void;
    onRepeatRequest?: (payload: RepeatRequest) => void;
    onSigningStatus?: (payload: SigningStatusPayload) => void;
    onUnderstood?: () => void;
    playNotifications?: boolean;
}

export interface UseSessionMessagesReturn {
    // State
    isConnected: boolean;
    repeatRequest: RepeatRequest | null;
    latestTranslation: TranslationPayload | null;
    signingStatus: SigningStatusPayload | null;
    conversationHistory: ConversationEntry[];

    // Actions - Doctor
    sendRepeatRequest: (reason: RepeatRequest['reason']) => void;
    sendUnderstood: () => void;

    // Actions - Patient
    sendTranslation: (translation: ASLTranslationResult, confidence: ConfidenceResult) => void;
    sendSigningStatus: (isSigning: boolean, signState: SignState, velocity?: number) => void;

    // Common
    clearRepeatRequest: () => void;
    refreshHistory: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useSessionMessages({
    role,
    onTranslation,
    onRepeatRequest,
    onSigningStatus,
    onUnderstood,
    playNotifications = true,
}: UseSessionMessagesOptions): UseSessionMessagesReturn {
    // Initialize session ID on mount
    useEffect(() => {
        initializeSession(`${role}-${Date.now()}`);
    }, [role]);

    // State
    const [isConnected, setIsConnected] = useState(false);
    const [repeatRequest, setRepeatRequest] = useState<RepeatRequest | null>(null);
    const [latestTranslation, setLatestTranslation] = useState<TranslationPayload | null>(null);
    const [signingStatus, setSigningStatus] = useState<SigningStatusPayload | null>(null);
    const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);

    // LiveKit data channel
    const { send, message } = useDataChannel('healthbridge-session', (msg) => {
        // ReceivedDataMessage has a payload property that contains the Uint8Array
        handleIncomingMessage(msg.payload);
    });

    // Track connection status
    const sendRef = useRef(send);
    useEffect(() => {
        sendRef.current = send;
        setIsConnected(!!send);
    }, [send]);

    // Handle incoming messages
    const handleIncomingMessage = useCallback((rawMessage: Uint8Array) => {
        try {
            const text = new TextDecoder().decode(rawMessage);
            const message = deserializeMessage(text);

            if (!message) return;

            switch (message.type) {
                case 'translation':
                    const translationPayload = message.payload as TranslationPayload;
                    setLatestTranslation(translationPayload);

                    // Add to history
                    addToHistory({
                        type: 'patient_asl',
                        text: translationPayload.text,
                        confidence: translationPayload.confidence,
                        timestamp: translationPayload.timestamp,
                    });
                    setConversationHistory(getConversationHistory());

                    // Play notification sound
                    if (playNotifications && role === 'doctor') {
                        playNotificationForConfidence(translationPayload.confidence.level);
                    }

                    onTranslation?.(translationPayload);
                    break;

                case 'repeat_request':
                    const repeatPayload = message.payload as RepeatRequest;
                    setRepeatRequest(repeatPayload);
                    onRepeatRequest?.(repeatPayload);
                    break;

                case 'signing_status':
                    const statusPayload = message.payload as SigningStatusPayload;
                    setSigningStatus(statusPayload);
                    onSigningStatus?.(statusPayload);
                    break;

                case 'understood':
                    setRepeatRequest(null);
                    onUnderstood?.();
                    break;

                default:
                    console.log('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Error handling session message:', error);
        }
    }, [role, playNotifications, onTranslation, onRepeatRequest, onSigningStatus, onUnderstood]);

    // Send utilities
    const sendMessage = useCallback((message: SessionMessage) => {
        if (!sendRef.current) {
            console.warn('Data channel not available');
            return;
        }

        const encoder = new TextEncoder();
        const data = encoder.encode(serializeMessage(message));
        sendRef.current(data, { reliable: true });
    }, []);

    // Doctor actions
    const sendRepeatRequest = useCallback((reason: RepeatRequest['reason']) => {
        const message = createRepeatRequest(reason, latestTranslation?.translationId);
        sendMessage(message);

        // Add to history
        addToHistory({
            type: 'doctor_request',
            text: `Asked patient to sign again (${reason})`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        setConversationHistory(getConversationHistory());
    }, [sendMessage, latestTranslation]);

    const sendUnderstood = useCallback(() => {
        const message = createUnderstoodMessage(latestTranslation?.translationId);
        sendMessage(message);
    }, [sendMessage, latestTranslation]);

    // Patient actions
    const sendTranslation = useCallback((
        translation: ASLTranslationResult,
        confidence: ConfidenceResult
    ) => {
        const message = createTranslationMessage(translation, confidence);
        sendMessage(message);

        // Clear any pending repeat request
        setRepeatRequest(null);
    }, [sendMessage]);

    const sendSigningStatus = useCallback((
        isSigning: boolean,
        signState: SignState,
        velocity?: number
    ) => {
        const message = createSigningStatusMessage(isSigning, signState, velocity);
        sendMessage(message);
    }, [sendMessage]);

    // Common actions
    const clearRepeatRequest = useCallback(() => {
        setRepeatRequest(null);
    }, []);

    const refreshHistory = useCallback(() => {
        setConversationHistory(getConversationHistory());
    }, []);

    return {
        isConnected,
        repeatRequest,
        latestTranslation,
        signingStatus,
        conversationHistory,
        sendRepeatRequest,
        sendUnderstood,
        sendTranslation,
        sendSigningStatus,
        clearRepeatRequest,
        refreshHistory,
    };
}

// ============================================================================
// Standalone Hook (for non-LiveKit contexts / fallback)
// ============================================================================

/**
 * Simplified version for demo/testing without LiveKit
 */
export function useSessionMessagesStandalone(): UseSessionMessagesReturn {
    const [repeatRequest, setRepeatRequest] = useState<RepeatRequest | null>(null);
    const [latestTranslation, setLatestTranslation] = useState<TranslationPayload | null>(null);
    const [signingStatus, setSigningStatus] = useState<SigningStatusPayload | null>(null);
    const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);

    return {
        isConnected: false,
        repeatRequest,
        latestTranslation,
        signingStatus,
        conversationHistory,
        sendRepeatRequest: (reason) => {
            console.log('Standalone: Would send repeat request:', reason);
        },
        sendUnderstood: () => {
            console.log('Standalone: Would send understood');
        },
        sendTranslation: (translation, confidence) => {
            setLatestTranslation({
                text: translation.translation,
                confidence,
                timestamp: translation.timestamp,
                translationId: `trans-${Date.now()}`,
            });
            addToHistory({
                type: 'patient_asl',
                text: translation.translation,
                confidence,
                timestamp: translation.timestamp,
            });
            setConversationHistory(getConversationHistory());
        },
        sendSigningStatus: (isSigning, signState, velocity) => {
            setSigningStatus({ isSigning, signState, velocity });
        },
        clearRepeatRequest: () => setRepeatRequest(null),
        refreshHistory: () => setConversationHistory(getConversationHistory()),
    };
}
