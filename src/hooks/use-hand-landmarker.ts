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
    signCompleteDelay: 600,    // Ms of stillness before sign is "complete" (reduced from 800)
    frameInterval: 100,        // Ms between frame captures for Gemini
};

// Velocity thresholds for motion detection
const VELOCITY_CONFIG = {
    movementThreshold: 0.02,   // Normalized units per frame (significant movement)
    stillnessThreshold: 0.005, // Normalized units per frame (considered still)
    historyLength: 5,          // Number of frames to average velocity over
    preparingTimeout: 300,     // Ms in preparing before auto-transitioning to signing
};

/**
 * Sign detection state machine states
 * idle: No hands detected, waiting
 * preparing: Hands detected, waiting for movement
 * signing: Active signing detected (hands moving)
 * completing: Movement stopped, waiting for stillness confirmation
 */
export type SignState = 'idle' | 'preparing' | 'signing' | 'completing';

export interface HandFrame {
    timestamp: number;
    imageData: string; // Base64 encoded frame
    landmarks: HandLandmarkerResult | null;
}

interface LandmarkPosition {
    x: number;
    y: number;
    z: number;
}

interface UseHandLandmarkerProps {
    onSignComplete?: (frames: HandFrame[]) => void;
    onStateChange?: (state: SignState) => void;
}

export function useHandLandmarker({ onSignComplete, onStateChange }: UseHandLandmarkerProps = {}) {
    // State
    const [isInitialized, setIsInitialized] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [handsDetected, setHandsDetected] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [signState, setSignState] = useState<SignState>('idle');
    const [currentVelocity, setCurrentVelocity] = useState(0);
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

    // State machine refs
    const currentStateRef = useRef<SignState>('idle');
    const stateEnterTimeRef = useRef<number>(0);
    const landmarkHistoryRef = useRef<LandmarkPosition[][]>([]);
    const preparingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

        // Handle sign capture logic using new state machine
        handleSignStateMachine(hasHands, results, canvas, now);

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

    /**
     * Calculate average velocity from landmark history
     * Uses wrist position (landmark 0) as reference point
     */
    const calculateVelocity = (results: HandLandmarkerResult): number => {
        if (!results.landmarks || results.landmarks.length === 0) {
            return 0;
        }

        // Extract wrist positions from all detected hands
        const currentPositions: LandmarkPosition[] = results.landmarks.map(hand => ({
            x: hand[0].x,
            y: hand[0].y,
            z: hand[0].z,
        }));

        // Add to history
        landmarkHistoryRef.current.push(currentPositions);

        // Keep only recent history
        if (landmarkHistoryRef.current.length > VELOCITY_CONFIG.historyLength) {
            landmarkHistoryRef.current.shift();
        }

        // Need at least 2 frames to calculate velocity
        if (landmarkHistoryRef.current.length < 2) {
            return 0;
        }

        // Calculate average velocity between consecutive frames
        let totalVelocity = 0;
        let count = 0;

        for (let i = 1; i < landmarkHistoryRef.current.length; i++) {
            const prev = landmarkHistoryRef.current[i - 1];
            const curr = landmarkHistoryRef.current[i];

            // Compare each hand's movement
            const maxHands = Math.min(prev.length, curr.length);
            for (let h = 0; h < maxHands; h++) {
                const dx = curr[h].x - prev[h].x;
                const dy = curr[h].y - prev[h].y;
                const dz = curr[h].z - prev[h].z;
                const velocity = Math.sqrt(dx * dx + dy * dy + dz * dz);
                totalVelocity += velocity;
                count++;
            }
        }

        return count > 0 ? totalVelocity / count : 0;
    };

    /**
     * Transition to a new state
     */
    const transitionState = (newState: SignState, now: number) => {
        if (currentStateRef.current === newState) return;

        const prevState = currentStateRef.current;
        currentStateRef.current = newState;
        stateEnterTimeRef.current = now;
        setSignState(newState);

        // Notify callback if provided
        if (onStateChange) {
            onStateChange(newState);
        }

        console.log(`🔄 Sign state: ${prevState} → ${newState}`);
    };

    /**
     * Handle sign capture state machine
     * States: idle → preparing → signing → completing → idle
     */
    const handleSignStateMachine = (
        hasHands: boolean,
        results: HandLandmarkerResult,
        canvas: HTMLCanvasElement,
        now: number
    ) => {
        const velocity = hasHands ? calculateVelocity(results) : 0;
        setCurrentVelocity(velocity);

        const state = currentStateRef.current;
        const timeInState = now - stateEnterTimeRef.current;

        switch (state) {
            case 'idle':
                if (hasHands) {
                    // Start preparing - hands detected
                    transitionState('preparing', now);
                    signStartTimeRef.current = now;
                    capturedFramesRef.current = [];
                    setIsCapturing(true);
                    landmarkHistoryRef.current = [];
                }
                break;

            case 'preparing':
                if (!hasHands) {
                    // Hands disappeared, back to idle
                    transitionState('idle', now);
                    resetCapture();
                } else if (velocity > VELOCITY_CONFIG.movementThreshold) {
                    // Significant movement detected - transition to signing
                    transitionState('signing', now);
                    console.log('🤟 Movement detected - capturing sign');
                } else if (timeInState > VELOCITY_CONFIG.preparingTimeout) {
                    // Auto-transition to signing after preparing timeout
                    // (handles static signs that don't involve movement)
                    transitionState('signing', now);
                    console.log('🤟 Static sign detected - capturing');
                }
                break;

            case 'signing':
                if (!hasHands) {
                    // Hands disappeared while signing
                    const signDuration = now - (signStartTimeRef.current || now);
                    if (signDuration >= SIGN_THRESHOLDS.minSignDuration) {
                        // Long enough, transition to completing
                        transitionState('completing', now);
                    } else {
                        // Too short, reset
                        transitionState('idle', now);
                        resetCapture();
                    }
                } else if (velocity < VELOCITY_CONFIG.stillnessThreshold) {
                    // Movement stopped - transition to completing
                    const signDuration = now - (signStartTimeRef.current || now);
                    if (signDuration >= SIGN_THRESHOLDS.minSignDuration) {
                        transitionState('completing', now);
                    }
                }
                break;

            case 'completing':
                if (hasHands && velocity > VELOCITY_CONFIG.movementThreshold) {
                    // Movement resumed - back to signing
                    transitionState('signing', now);
                } else if (timeInState >= SIGN_THRESHOLDS.signCompleteDelay) {
                    // Stillness confirmed - complete the sign
                    completeSign();
                    transitionState('idle', now);
                } else if (!hasHands) {
                    // Hands disappeared, still complete if we have frames
                    if (timeInState >= SIGN_THRESHOLDS.signCompleteDelay / 2) {
                        completeSign();
                        transitionState('idle', now);
                    }
                }
                break;
        }

        // Capture frames during preparing, signing, and completing states
        if (state !== 'idle' && hasHands) {
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
        landmarkHistoryRef.current = [];

        if (signCompleteTimeoutRef.current) {
            clearTimeout(signCompleteTimeoutRef.current);
            signCompleteTimeoutRef.current = null;
        }

        if (preparingTimeoutRef.current) {
            clearTimeout(preparingTimeoutRef.current);
            preparingTimeoutRef.current = null;
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
        signState,
        currentVelocity,
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
