'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { GeminiClientEvent, GeminiServerEvent } from '@/types/gemini';
import { SYSTEM_INSTRUCTION } from '@/lib/prompts';
import { detectMedicalTerms, MedicalTerm } from '@/lib/gemini-3-service';

interface UseGeminiClientProps {
    apiKey?: string;
    url?: string;
}

export type { MedicalTerm };

export function useGeminiClient({ apiKey, url = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent" }: UseGeminiClientProps) {
    const [isConnected, setIsConnected] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState<string>("");
    const [medicalTerms, setMedicalTerms] = useState<MedicalTerm[]>([]);
    const [error, setError] = useState<string | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);

    // Intelligence Loop Ref
    const processingRef = useRef<{ lastLength: number; isProcessing: boolean }>({
        lastLength: 0,
        isProcessing: false
    });

    const connect = useCallback(async () => {
        setError(null);
        if (!apiKey) {
            setError("No API key provided");
            return;
        }

        try {
            const wsUrl = `${url}?key=${apiKey}`;
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log("WebSocket Connected");
                setIsConnected(true);
                // Send setup message - Using gemini-2.0-flash-exp (v1alpha required for audio streaming)
                const setupMsg: GeminiClientEvent = {
                    setup: {
                        model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
                        generationConfig: {
                            responseModalities: ["AUDIO"],
                        },
                        systemInstruction: {
                            parts: [{ text: SYSTEM_INSTRUCTION }]
                        },
                    },
                };
                ws.send(JSON.stringify(setupMsg));
            };

            ws.onmessage = async (event) => {
                try {
                    // Live API sends Blob data, not text
                    let data: string;
                    if (event.data instanceof Blob) {
                        data = await event.data.text();
                    } else {
                        data = event.data;
                    }

                    const msg = JSON.parse(data) as GeminiServerEvent;
                    console.log("Received message:", msg);

                    // Handle Text Content from model turn
                    if ('serverContent' in msg && msg.serverContent?.modelTurn?.parts) {
                        const parts = msg.serverContent.modelTurn.parts;
                        for (const part of parts) {
                            if ('text' in part && part.text) {
                                console.log("Transcript text:", part.text);
                                setTranscript(prev => prev + part.text);
                            }
                        }
                    }

                    // Note: WebSocket tool calls removed. Jargon detection is now handled via the Effect below.

                } catch (e) {
                    console.error("Error parsing message", e, event.data);
                }
            };

            ws.onclose = (event) => {
                console.log("WebSocket Closed", event.code, event.reason);
                setIsConnected(false);
                setIsRecording(false);
                if (event.code !== 1000 && event.code !== 1005) {
                    setError(`Disconnected: Code ${event.code} ${event.reason || ""}`);
                }
            };

            ws.onerror = (err) => {
                console.error("WebSocket Error", err);
                setError("WebSocket Error Check console for details.");
            };

            wsRef.current = ws;

        } catch (error: any) {
            console.error("Connection failed", error);
            setError(error.toString());
        }
    }, [apiKey, url]);

    // Intelligence Loop: Poll Gemini 3 for medical terms
    useEffect(() => {
        const intervalId = setInterval(async () => {
            if (!transcript || processingRef.current.isProcessing) return;

            const currentLength = transcript.length;
            const lastLength = processingRef.current.lastLength;

            // Only process if we have significant new content (~30 chars)
            if (currentLength - lastLength > 30) {
                processingRef.current.isProcessing = true;

                const newSegment = transcript.slice(lastLength);
                console.log(" analyzing segment:", newSegment);

                try {
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
                } catch (err) {
                    console.error("Jargon detection failed", err);
                } finally {
                    processingRef.current.isProcessing = false;
                }
            }
        }, 3000); // Check every 3 seconds

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
                        mediaChunks: [{
                            mimeType: "audio/pcm;rate=16000",
                            data: b64
                        }]
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
        if (wsRef.current) {
            wsRef.current.close();
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
        // Reset intelligence loop
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
        transcript,
        medicalTerms,
        error,
        connect,
        disconnect,
        startAudio
    };
}
