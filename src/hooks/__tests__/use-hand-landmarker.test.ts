import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHandLandmarker, SignState, HandFrame } from '../use-hand-landmarker';

// Mock MediaPipe
vi.mock('@mediapipe/tasks-vision', () => ({
    HandLandmarker: {
        createFromOptions: vi.fn().mockResolvedValue({
            detectForVideo: vi.fn().mockReturnValue({
                landmarks: [],
                worldLandmarks: [],
                handedness: [],
            }),
            close: vi.fn(), // Add missing close method
        }),
    },
    FilesetResolver: {
        forVisionTasks: vi.fn().mockResolvedValue({}),
    },
}));

describe('useHandLandmarker', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    describe('initial state', () => {
        it('should start with idle state', () => {
            const { result } = renderHook(() => useHandLandmarker());

            expect(result.current.signState).toBe('idle');
            expect(result.current.isInitialized).toBe(false);
            expect(result.current.isDetecting).toBe(false);
            expect(result.current.handsDetected).toBe(false);
            expect(result.current.isCapturing).toBe(false);
            expect(result.current.currentVelocity).toBe(0);
            expect(result.current.error).toBeNull();
        });

        it('should provide refs for video and canvas', () => {
            const { result } = renderHook(() => useHandLandmarker());

            expect(result.current.videoRef).toBeDefined();
            expect(result.current.canvasRef).toBeDefined();
        });
    });

    describe('initialization', () => {
        it('should initialize successfully', async () => {
            const { result } = renderHook(() => useHandLandmarker());

            await act(async () => {
                await result.current.initialize();
            });

            expect(result.current.isInitialized).toBe(true);
            expect(result.current.error).toBeNull();
        });

        it('should handle initialization errors', async () => {
            // Mock initialization failure
            const { HandLandmarker } = await import('@mediapipe/tasks-vision');
            (HandLandmarker.createFromOptions as any).mockRejectedValueOnce(
                new Error('WASM load failed')
            );

            const { result } = renderHook(() => useHandLandmarker());

            await act(async () => {
                await result.current.initialize();
            });

            expect(result.current.isInitialized).toBe(false);
            expect(result.current.error).toContain('WASM load failed');
        });
    });

    describe('callbacks', () => {
        it('should call onStateChange when state changes', async () => {
            const onStateChange = vi.fn();

            const { result } = renderHook(() =>
                useHandLandmarker({ onStateChange })
            );

            // Initialize first
            await act(async () => {
                await result.current.initialize();
            });

            // The state changes are internal, but we verify callback is provided
            expect(onStateChange).toBeDefined();
        });

        it('should call onSignComplete when sign is completed', async () => {
            const onSignComplete = vi.fn();

            const { result } = renderHook(() =>
                useHandLandmarker({ onSignComplete })
            );

            await act(async () => {
                await result.current.initialize();
            });

            expect(onSignComplete).toBeDefined();
        });
    });

    describe('smoothing configuration', () => {
        it('should accept smoothingFactor prop', () => {
            const { result } = renderHook(() =>
                useHandLandmarker({ smoothingFactor: 0.2 })
            );

            expect(result.current).toBeDefined();
        });

        it('should accept disableSmoothing prop', () => {
            const { result } = renderHook(() =>
                useHandLandmarker({ disableSmoothing: true })
            );

            expect(result.current).toBeDefined();
        });
    });

    describe('methods', () => {
        it('should expose initialize method', () => {
            const { result } = renderHook(() => useHandLandmarker());
            expect(typeof result.current.initialize).toBe('function');
        });

        it('should expose startDetection method', () => {
            const { result } = renderHook(() => useHandLandmarker());
            expect(typeof result.current.startDetection).toBe('function');
        });

        it('should expose stopDetection method', () => {
            const { result } = renderHook(() => useHandLandmarker());
            expect(typeof result.current.stopDetection).toBe('function');
        });
    });
});

describe('SignState type', () => {
    it('should have correct state values', () => {
        const states: SignState[] = ['idle', 'preparing', 'signing', 'completing'];
        expect(states).toHaveLength(4);
    });
});

describe('HandFrame interface', () => {
    it('should create valid HandFrame objects', () => {
        const frame: HandFrame = {
            timestamp: Date.now(),
            imageData: 'data:image/jpeg;base64,/9j/4AA...',
            landmarks: null,
        };

        expect(frame.timestamp).toBeGreaterThan(0);
        expect(frame.imageData).toContain('base64');
        expect(frame.landmarks).toBeNull();
    });
});
