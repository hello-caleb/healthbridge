'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
    HandLandmarker,
    FilesetResolver,
    HandLandmarkerResult,
} from '@mediapipe/tasks-vision';

// Configuration
const DETECTION_CONFIG = {
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
    numHands: 2,
    runningMode: 'VIDEO' as const,
};

// Time thresholds for sign detection
const SIGN_THRESHOLDS = {
    minSignDuration: 500,      // Minimum ms hands must be visible
    signCompleteDelay: 800,    // Ms of no hands before sign is "complete"
    frameInterval: 100,        // Ms between frame captures for Gemini
};

export interface HandFrame {
    timestamp: number;
    imageData: string; // Base64 encoded frame
    landmarks: HandLandmarkerResult | null;
}

interface UseHandLandmarkerProps {
    onSignComplete?: (frames: HandFrame[]) => void;
}

export function useHandLandmarker({ onSignComplete }: UseHandLandmarkerProps = {}) {
    // State
    const [isInitialized, setIsInitialized] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [handsDetected, setHandsDetected] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Refs
    const handLandmarkerRef = useRef<HandLandmarker | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Sign capture state
    const capturedFramesRef = useRef<HandFrame[]>([]);
    const lastHandsDetectedRef = useRef<number>(0);
    const signStartTimeRef = useRef<number | null>(null);
    const lastFrameCaptureRef = useRef<number>(0);
    const signCompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize MediaPipe HandLandmarker
    const initialize = useCallback(async () => {
        try {
            setError(null);
            console.log('🖐️ Initializing HandLandmarker...');

            // Load WASM files from CDN
            const vision = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
            );

            // Create HandLandmarker
            const handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
                    delegate: 'GPU',
                },
                ...DETECTION_CONFIG,
            });

            handLandmarkerRef.current = handLandmarker;
            setIsInitialized(true);
            console.log('✅ HandLandmarker initialized');

        } catch (err: any) {
            console.error('❌ HandLandmarker initialization failed:', err);
            setError(`Failed to initialize hand detection: ${err.message}`);
        }
    }, []);

    // Start camera and detection
    const startDetection = useCallback(async (videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement) => {
        if (!handLandmarkerRef.current) {
            await initialize();
        }

        if (!handLandmarkerRef.current) {
            setError('Hand detection not initialized');
            return;
        }

        try {
            // Get camera stream
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user',
                },
            });

            videoElement.srcObject = stream;
            await videoElement.play();

            videoRef.current = videoElement;
            canvasRef.current = canvasElement;
            streamRef.current = stream;

            // Set canvas dimensions
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;

            setIsDetecting(true);
            console.log('📹 Camera started, beginning hand detection');

            // Start detection loop
            detectHands();

        } catch (err: any) {
            console.error('❌ Camera start failed:', err);
            setError(`Camera access failed: ${err.message}`);
        }
    }, [initialize]);

    // Detection loop
    const detectHands = useCallback(() => {
        if (!handLandmarkerRef.current || !videoRef.current || !canvasRef.current) {
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx || video.readyState !== 4) {
            animationFrameRef.current = requestAnimationFrame(detectHands);
            return;
        }

        const now = performance.now();

        // Run hand detection
        const results = handLandmarkerRef.current.detectForVideo(video, now);
        const hasHands = results.landmarks && results.landmarks.length > 0;

        setHandsDetected(hasHands);

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Draw hand landmarks overlay
        if (hasHands && results.landmarks) {
            drawLandmarks(ctx, results.landmarks);
        }

        // Handle sign capture logic
        handleSignCapture(hasHands, results, canvas, now);

        // Continue loop
        animationFrameRef.current = requestAnimationFrame(detectHands);
    }, []);

    // Draw hand landmarks on canvas
    const drawLandmarks = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
        landmarks.forEach((hand) => {
            // Draw connections
            const connections = [
                [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
                [0, 5], [5, 6], [6, 7], [7, 8],       // Index
                [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
                [0, 13], [13, 14], [14, 15], [15, 16], // Ring
                [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
                [5, 9], [9, 13], [13, 17],             // Palm
            ];

            ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)'; // Emerald
            ctx.lineWidth = 2;

            connections.forEach(([start, end]) => {
                const startPoint = hand[start];
                const endPoint = hand[end];
                ctx.beginPath();
                ctx.moveTo(startPoint.x * ctx.canvas.width, startPoint.y * ctx.canvas.height);
                ctx.lineTo(endPoint.x * ctx.canvas.width, endPoint.y * ctx.canvas.height);
                ctx.stroke();
            });

            // Draw landmarks
            hand.forEach((landmark: any) => {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.beginPath();
                ctx.arc(
                    landmark.x * ctx.canvas.width,
                    landmark.y * ctx.canvas.height,
                    4,
                    0,
                    2 * Math.PI
                );
                ctx.fill();
            });
        });
    };

    // Handle sign capture state machine
    const handleSignCapture = (
        hasHands: boolean,
        results: HandLandmarkerResult,
        canvas: HTMLCanvasElement,
        now: number
    ) => {
        if (hasHands) {
            lastHandsDetectedRef.current = now;

            // Clear any pending "sign complete" timeout
            if (signCompleteTimeoutRef.current) {
                clearTimeout(signCompleteTimeoutRef.current);
                signCompleteTimeoutRef.current = null;
            }

            // Start capturing if not already
            if (!signStartTimeRef.current) {
                signStartTimeRef.current = now;
                capturedFramesRef.current = [];
                setIsCapturing(true);
                console.log('🤟 Sign started - capturing frames');
            }

            // Capture frame at intervals
            if (now - lastFrameCaptureRef.current >= SIGN_THRESHOLDS.frameInterval) {
                lastFrameCaptureRef.current = now;

                // Capture frame as base64
                const imageData = canvas.toDataURL('image/jpeg', 0.7);

                capturedFramesRef.current.push({
                    timestamp: now,
                    imageData,
                    landmarks: results,
                });
            }

        } else if (signStartTimeRef.current) {
            // Hands disappeared - check if sign is complete
            const signDuration = now - signStartTimeRef.current;

            if (signDuration >= SIGN_THRESHOLDS.minSignDuration) {
                // Set timeout to complete sign
                if (!signCompleteTimeoutRef.current) {
                    signCompleteTimeoutRef.current = setTimeout(() => {
                        completeSign();
                    }, SIGN_THRESHOLDS.signCompleteDelay);
                }
            } else {
                // Sign was too short, reset
                resetCapture();
            }
        }
    };

    // Complete sign capture and trigger callback
    const completeSign = useCallback(() => {
        const frames = capturedFramesRef.current;

        if (frames.length > 0 && onSignComplete) {
            console.log(`✅ Sign complete - captured ${frames.length} frames`);
            onSignComplete(frames);
        }

        resetCapture();
    }, [onSignComplete]);

    // Reset capture state
    const resetCapture = () => {
        signStartTimeRef.current = null;
        capturedFramesRef.current = [];
        setIsCapturing(false);

        if (signCompleteTimeoutRef.current) {
            clearTimeout(signCompleteTimeoutRef.current);
            signCompleteTimeoutRef.current = null;
        }
    };

    // Stop detection
    const stopDetection = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        resetCapture();
        setIsDetecting(false);
        setHandsDetected(false);
        console.log('🛑 Hand detection stopped');
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopDetection();
            if (handLandmarkerRef.current) {
                handLandmarkerRef.current.close();
            }
        };
    }, [stopDetection]);

    return {
        // State
        isInitialized,
        isDetecting,
        handsDetected,
        isCapturing,
        error,

        // Methods
        initialize,
        startDetection,
        stopDetection,

        // Refs for video/canvas elements
        videoRef,
        canvasRef,
    };
}
