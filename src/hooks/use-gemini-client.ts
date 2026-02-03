'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { GeminiClientEvent, GeminiServerEvent } from '@/types/gemini';

interface UseGeminiClientProps {
    apiKey?: string;
    url?: string;
}

export function useGeminiClient({ apiKey, url = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent" }: UseGeminiClientProps) {
    const [isConnected, setIsConnected] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState<string>("");

    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);

    const connect = useCallback(async () => {
        if (!apiKey) {
            console.error("No API key provided");
            return;
        }

        try {
            const wsUrl = `${url}?key=${apiKey}`;
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log("WebSocket Connected");
                setIsConnected(true);
                // Send setup message
                const setupMsg: GeminiClientEvent = {
                    setup: {
                        model: "models/gemini-2.0-flash-exp", // Or appropriate model
                        generationConfig: {
                            responseModalities: ["TEXT"], // Start with TEXT for simplicity, can add AUDIO
                        },
                    },
                };
                ws.send(JSON.stringify(setupMsg));
            };

            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data) as GeminiServerEvent;

                    if ('serverContent' in msg) {
                        const parts = msg.serverContent.modelTurn?.parts || [];
                        const text = parts.map(p => 'text' in p ? p.text : '').join('');
                        if (text) {
                            setTranscript(prev => prev + text);
                        }
                    }
                } catch (e) {
                    console.error("Error parsing message", e);
                }
            };

            ws.onclose = () => {
                console.log("WebSocket Closed");
                setIsConnected(false);
                setIsRecording(false);
            };

            ws.onerror = (err) => {
                console.error("WebSocket Error", err);
            };

            wsRef.current = ws;

        } catch (error) {
            console.error("Connection failed", error);
        }
    }, [apiKey, url]);

    const startAudio = useCallback(async () => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } });
            const audioContext = new AudioContext({ sampleRate: 16000 });

            await audioContext.audioWorklet.addModule('/worklets/downsampler.js');

            const source = audioContext.createMediaStreamSource(stream);
            const worklet = new AudioWorkletNode(audioContext, 'pcm-processor');

            worklet.port.onmessage = (event) => {
                if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

                const pcm16 = event.data as Int16Array;
                // Convert to base64
                // Note: For large buffers effectively, simple btoa on string might stack overflow, 
                // but for worklet chunks (typically 128 frames) it's small.
                // However, standard Worklet size is 128 frames ~ 8ms, which is very frequent.
                // We buffer or send immediately. Let's send immediately for low latency.

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
            // Worklet doesn't need to connect to destination if we don't want to hear ourselves.
            // source.connect(worklet).connect(audioContext.destination); 

            streamRef.current = stream;
            audioContextRef.current = audioContext;
            workletNodeRef.current = worklet;
            setIsRecording(true);
            console.log("Audio started");

        } catch (err) {
            console.error("Error starting audio", err);
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
        connect,
        disconnect,
        startAudio
    };
}
