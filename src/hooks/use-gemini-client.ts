'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { GeminiClientEvent, GeminiServerEvent } from '@/types/gemini';
import { SYSTEM_INSTRUCTION } from '@/lib/prompts';
import { detectMedicalTerms, MedicalTerm } from '@/lib/gemini-3-service';
import { ApiUsageTracker } from '@/lib/api-usage-tracker';

interface UseGeminiClientProps {
    apiKey?: string;
    url?: string;
}

export type { MedicalTerm };

// Reconnection configuration
const RECONNECT_CONFIG = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second, doubles each retry (1s, 2s, 4s)
    connectionTimeout: 10000, // 10 seconds to establish connection
};

// Model configuration with fallbacks
// Only gemini-2.5-flash-native-audio-preview models support Live API!
const MODEL_CONFIG = {
    // Try the Sep 2025 version first (more widely available)
    primary: "models/gemini-2.5-flash-native-audio-preview-09-2025",
    // Alternative: Dec 2025 version
    alternatives: [
        "models/gemini-2.5-flash-native-audio-preview-12-2025",
    ]
};

export function useGeminiClient({ apiKey, url = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent" }: UseGeminiClientProps) {
    const [isConnected, setIsConnected] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState<string>("");
    const [medicalTerms, setMedicalTerms] = useState<MedicalTerm[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Reconnection state
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const [isReconnecting, setIsReconnecting] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const shouldReconnectRef = useRef(true); // Flag to prevent reconnect after manual disconnect

    // Intelligence Loop Ref
    const processingRef = useRef<{ lastLength: number; isProcessing: boolean }>({
        lastLength: 0,
        isProcessing: false
    });

    // Attempt reconnection with exponential backoff
    const attemptReconnect = useCallback(() => {
        if (!shouldReconnectRef.current) return;

        const currentAttempt = reconnectAttempts;
        if (currentAttempt >= RECONNECT_CONFIG.maxRetries) {
            setError(`Connection lost after ${RECONNECT_CONFIG.maxRetries} reconnection attempts. Please try again.`);
            setIsReconnecting(false);
            setReconnectAttempts(0);
            return;
        }

        const delay = RECONNECT_CONFIG.baseDelay * Math.pow(2, currentAttempt);
        console.log(`🔄 Reconnecting in ${delay}ms (attempt ${currentAttempt + 1}/${RECONNECT_CONFIG.maxRetries})`);
        setIsReconnecting(true);
        setReconnectAttempts(currentAttempt + 1);

        reconnectTimeoutRef.current = setTimeout(() => {
            connect();
        }, delay);
    }, [reconnectAttempts]);

    const connect = useCallback(async () => {
        setError(null);
        shouldReconnectRef.current = true; // Enable auto-reconnect for this session

        if (!apiKey) {
            setError("No API key provided");
            return;
        }

        // Clear any pending reconnection
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        try {
            const wsUrl = `${url}?key=${apiKey}`;
            const ws = new WebSocket(wsUrl);

            // Connection timeout
            connectionTimeoutRef.current = setTimeout(() => {
                if (ws.readyState !== WebSocket.OPEN) {
                    console.warn("⏱️ Connection timeout");
                    ws.close();
                    setError("Connection timeout. Please check your network and try again.");
                }
            }, RECONNECT_CONFIG.connectionTimeout);

            ws.onopen = () => {
                console.log("✅ WebSocket Connected");

                // Clear connection timeout
                if (connectionTimeoutRef.current) {
                    clearTimeout(connectionTimeoutRef.current);
                    connectionTimeoutRef.current = null;
                }

                // Reset reconnection state on successful connect
                setIsConnected(true);
                setIsReconnecting(false);
                setReconnectAttempts(0);
                setError(null);

                // Send setup message - use stable model
                const setupMsg: GeminiClientEvent = {
                    setup: {
                        model: MODEL_CONFIG.primary,
                        generationConfig: {
                            responseModalities: ["AUDIO"],
                        },
                        inputAudioTranscription: {},
                        systemInstruction: {
                            parts: [{ text: SYSTEM_INSTRUCTION }]
                        },
                    },
                };
                ws.send(JSON.stringify(setupMsg));
            };

            ws.onmessage = async (event) => {
                try {
                    let data: string;
                    if (event.data instanceof Blob) {
                        data = await event.data.text();
                    } else {
                        data = event.data;
                    }

                    const msg = JSON.parse(data) as GeminiServerEvent;
                    console.log("Received message:", msg);

                    // Handle real-time input audio transcription
                    if ('serverContent' in msg && msg.serverContent?.inputTranscription?.text) {
                        const transcribedText = msg.serverContent.inputTranscription.text;
                        console.log("Input transcription:", transcribedText);
                        setTranscript(prev => prev + transcribedText + " ");
                    }

                    // Handle Text Content from model turn
                    if ('serverContent' in msg && msg.serverContent?.modelTurn?.parts) {
                        const parts = msg.serverContent.modelTurn.parts;
                        for (const part of parts) {
                            if ('text' in part && part.text) {
                                console.log("Model response text:", part.text);
                            }
                        }
                    }
                } catch (e) {
                    console.error("Error parsing message", e, event.data);
                }
            };

            ws.onclose = (event) => {
                console.log("WebSocket Closed", event.code, event.reason);

                // Clear connection timeout
                if (connectionTimeoutRef.current) {
                    clearTimeout(connectionTimeoutRef.current);
                    connectionTimeoutRef.current = null;
                }

                setIsConnected(false);
                setIsRecording(false);

                // Handle specific error codes
                if (event.code === 1011) {
                    // Server error - likely model access issue
                    console.error("❌ Server error (1011) - model may not be available for this API key");
                    setError("Connection failed: The Live API model may not be available for your account. Please check your API key permissions at ai.google.dev");
                    // Don't auto-reconnect for access issues
                    return;
                }

                // Auto-reconnect on non-clean close (not 1000=normal, 1005=no status)
                if (event.code !== 1000 && event.code !== 1005 && shouldReconnectRef.current) {
                    setError(`Connection lost (Code ${event.code}). Reconnecting...`);
                    attemptReconnect();
                } else if (event.code !== 1000 && event.code !== 1005) {
                    setError(`Disconnected: Code ${event.code} ${event.reason || ""}`);
                }
            };

            ws.onerror = (err) => {
                console.error("WebSocket Error", err);
                // Don't set error here - let onclose handle it with reconnection
            };

            wsRef.current = ws;

        } catch (error: any) {
            console.error("Connection failed", error);
            setError(error.toString());

            // Attempt reconnection on connection failure
            if (shouldReconnectRef.current) {
                attemptReconnect();
            }
        }
    }, [apiKey, url, attemptReconnect]);

    // Intelligence Loop: Poll Gemini 3 for medical terms
    // Track rate limit state
    const rateLimitRef = useRef({ isRateLimited: false, retryAfter: 0, dailyCalls: 0 });

    useEffect(() => {
        const intervalId = setInterval(async () => {
            if (!transcript || processingRef.current.isProcessing) return;

            // Check if rate limited or daily limit reached (max 15 calls to stay under free tier)
            if (rateLimitRef.current.isRateLimited || !ApiUsageTracker.checkAvailability('jargon')) {
                return;
            }

            const currentLength = transcript.length;
            const lastLength = processingRef.current.lastLength;

            // Only process if we have significant new content (~100 chars for less frequent calls)
            if (currentLength - lastLength > 100) {
                processingRef.current.isProcessing = true;

                const newSegment = transcript.slice(lastLength);
                console.log("📋 analyzing segment:", newSegment);

                try {
                    rateLimitRef.current.dailyCalls++;
                    ApiUsageTracker.increment('jargon');
                    const terms = await detectMedicalTerms(newSegment);
                    if (terms.length > 0) {
                        // Add timestamps manually since REST API doesn't give them
                        const timestampedTerms = terms.map(t => ({
                            ...t,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }));
                        setMedicalTerms(prev => [...timestampedTerms, ...prev]);
                    }
                    // Update pointer only after successful process (or even if empty, to avoid stuck loop)
                    processingRef.current.lastLength = currentLength;
                } catch (err: any) {
                    console.error("Jargon detection failed", err);
                    // Handle 429 rate limit errors
                    if (err.message?.includes('429') || err.message?.includes('quota')) {
                        console.warn("⚠️ Rate limited. Pausing jargon detection for this session.");
                        rateLimitRef.current.isRateLimited = true;
                    }
                } finally {
                    processingRef.current.isProcessing = false;
                }
            }
        }, 8000); // Check every 8 seconds (increased responsiveness from 30s)

        return () => clearInterval(intervalId);
    }, [transcript]);

    const startAudio = useCallback(async () => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } });
            const audioContext = new AudioContext({ sampleRate: 16000 });

            try {
                await audioContext.audioWorklet.addModule('/worklets/downsampler.js');
            } catch (e) {
                setError("Failed to load audio worklet. Check /worklets/downsampler.js");
                return;
            }

            const source = audioContext.createMediaStreamSource(stream);
            const worklet = new AudioWorkletNode(audioContext, 'pcm-processor');

            worklet.port.onmessage = (event) => {
                if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

                const pcm16 = event.data as Int16Array;
                // Convert to base64
                const buffer = new Uint8Array(pcm16.buffer);
                let binary = '';
                const len = buffer.byteLength;
                for (let i = 0; i < len; i++) {
                    binary += String.fromCharCode(buffer[i]);
                }
                const b64 = btoa(binary);

                const msg: GeminiClientEvent = {
                    realtimeInput: {
                        audio: {
                            data: b64,
                            mimeType: "audio/pcm;rate=16000"
                        }
                    }
                };

                wsRef.current.send(JSON.stringify(msg));
            };

            source.connect(worklet);

            streamRef.current = stream;
            audioContextRef.current = audioContext;
            workletNodeRef.current = worklet;
            setIsRecording(true);
            console.log("Audio started");

        } catch (err: any) {
            console.error("Error starting audio", err);
            setError(`Audio Error: ${err.message}`);
        }
    }, []);

    const disconnect = useCallback(() => {
        // Prevent auto-reconnect on manual disconnect
        shouldReconnectRef.current = false;

        // Clear pending reconnection/timeout
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close(1000, 'User disconnected'); // Clean close
            wsRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        setIsConnected(false);
        setIsRecording(false);
        setIsReconnecting(false);
        setReconnectAttempts(0);
        // Note: We preserve transcript and medicalTerms intentionally
        // Reset intelligence loop pointer only
        processingRef.current = { lastLength: 0, isProcessing: false };
    }, []);

    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        isConnected,
        isRecording,
        isReconnecting,
        reconnectAttempts,
        transcript,
        medicalTerms,
        error,
        connect,
        disconnect,
        startAudio
    };
}
