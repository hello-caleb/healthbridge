import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    selectKeyFramesAdaptive,
    getSelectedFrames,
    FrameSelectionConfig,
} from '../adaptive-frame-select';
import { HandFrame } from '@/hooks/use-hand-landmarker';

// Helper to create mock frames with motion
function createMockFramesWithMotion(count: number): HandFrame[] {
    return Array.from({ length: count }, (_, i) => {
        // Create motion pattern: start slow, middle fast, end slow
        const motion = i < count / 3
            ? i * 0.01
            : i > (2 * count) / 3
                ? (count - i) * 0.01
                : 0.05;

        return {
            timestamp: Date.now() + i * 100,
            imageData: 'data:image/jpeg;base64,' + 'A'.repeat(2000),
            landmarks: {
                landmarks: [
                    Array.from({ length: 21 }, (_, j) => ({
                        x: 0.5 + motion,
                        y: 0.5 + motion * 0.5,
                        z: 0,
                    })),
                ],
                worldLandmarks: [],
                handedness: [],
            },
        };
    });
}

function createMockFramesWithoutLandmarks(count: number): HandFrame[] {
    return Array.from({ length: count }, (_, i) => ({
        timestamp: Date.now() + i * 100,
        imageData: 'data:image/jpeg;base64,' + 'A'.repeat(2000),
        landmarks: null,
    }));
}

describe('adaptive-frame-select', () => {
    describe('selectKeyFramesAdaptive', () => {
        it('should return all frames if count <= maxFrames', () => {
            const frames = createMockFramesWithMotion(5);
            const result = selectKeyFramesAdaptive(frames, { maxFrames: 8 });

            expect(result).toEqual([0, 1, 2, 3, 4]);
        });

        it('should return maxFrames when more frames available', () => {
            const frames = createMockFramesWithMotion(20);
            const result = selectKeyFramesAdaptive(frames, { maxFrames: 8 });

            expect(result.length).toBeLessThanOrEqual(8);
        });

        it('should include first and last frame when includeEndpoints is true', () => {
            const frames = createMockFramesWithMotion(20);
            const result = selectKeyFramesAdaptive(frames, {
                maxFrames: 8,
                includeEndpoints: true
            });

            expect(result).toContain(0);
            expect(result).toContain(19);
        });

        it('should return empty array for empty input', () => {
            const result = selectKeyFramesAdaptive([], { maxFrames: 8 });
            expect(result).toEqual([]);
        });

        it('should fall back to even distribution without landmarks', () => {
            const frames = createMockFramesWithoutLandmarks(20);
            const result = selectKeyFramesAdaptive(frames, {
                maxFrames: 5,
                useAdaptiveSelection: true
            });

            expect(result.length).toBe(5);
        });

        it('should use even distribution when useAdaptiveSelection is false', () => {
            const frames = createMockFramesWithMotion(20);
            const result = selectKeyFramesAdaptive(frames, {
                maxFrames: 5,
                useAdaptiveSelection: false
            });

            // Even distribution should give sorted indices with first and last
            expect(result.length).toBe(5);
            expect(result[0]).toBe(0);
            expect(result[result.length - 1]).toBe(19);
        });

        it('should return sorted indices', () => {
            const frames = createMockFramesWithMotion(30);
            const result = selectKeyFramesAdaptive(frames, { maxFrames: 10 });

            const sorted = [...result].sort((a, b) => a - b);
            expect(result).toEqual(sorted);
        });
    });

    describe('getSelectedFrames', () => {
        it('should return frames at specified indices', () => {
            const frames = createMockFramesWithMotion(10);
            const indices = [0, 3, 6, 9];
            const result = getSelectedFrames(frames, indices);

            expect(result.length).toBe(4);
            expect(result[0]).toBe(frames[0]);
            expect(result[1]).toBe(frames[3]);
            expect(result[2]).toBe(frames[6]);
            expect(result[3]).toBe(frames[9]);
        });

        it('should filter out invalid indices', () => {
            const frames = createMockFramesWithMotion(5);
            const indices = [-1, 0, 2, 10, 4];
            const result = getSelectedFrames(frames, indices);

            expect(result.length).toBe(3); // Only 0, 2, 4 are valid
        });

        it('should handle empty indices', () => {
            const frames = createMockFramesWithMotion(5);
            const result = getSelectedFrames(frames, []);

            expect(result).toEqual([]);
        });
    });
});
