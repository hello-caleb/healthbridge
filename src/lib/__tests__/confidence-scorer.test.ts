import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    calculateConfidence,
    getConfidenceClass,
    getConfidenceIcon,
    ConfidenceResult,
    ConfidenceFactors,
} from '../confidence-scorer';
import { HandFrame } from '@/hooks/use-hand-landmarker';

// Helper to create mock frames
function createMockFrames(count: number, withLandmarks: boolean = true): HandFrame[] {
    return Array.from({ length: count }, (_, i) => ({
        timestamp: Date.now() + i * 100,
        imageData: 'data:image/jpeg;base64,' + 'A'.repeat(2000),
        landmarks: withLandmarks
            ? {
                landmarks: [
                    Array.from({ length: 21 }, (_, j) => ({
                        x: 0.5 + (i * 0.01) + (j * 0.001),
                        y: 0.5 + (i * 0.01),
                        z: 0,
                    })),
                ],
                worldLandmarks: [],
                handedness: [],
            }
            : null,
    }));
}

describe('confidence-scorer', () => {
    describe('calculateConfidence', () => {
        it('should return high confidence for clear translation with good frames', () => {
            const frames = createMockFrames(8);
            const result = calculateConfidence('pain', frames, 1500);

            expect(result.score).toBeGreaterThanOrEqual(70);
            expect(result.level).toMatch(/high|medium/);
            expect(result.factors).toBeDefined();
        });

        it('should return low confidence for unclear translation', () => {
            const frames = createMockFrames(5);
            const result = calculateConfidence('[unclear]', frames, 1000);

            expect(result.score).toBeLessThan(70);
            expect(result.level).toMatch(/low|very-low/);
        });

        it('should return zero confidence for translation errors', () => {
            const frames = createMockFrames(3);
            const result = calculateConfidence('[translation error]', frames, 500);

            expect(result.score).toBeLessThan(60);
        });

        it('should penalize very short sign duration', () => {
            const frames = createMockFrames(3);
            const shortResult = calculateConfidence('hello', frames, 200);
            const normalResult = calculateConfidence('hello', frames, 1500);

            expect(shortResult.factors.signDuration).toBeLessThan(
                normalResult.factors.signDuration
            );
        });

        it('should penalize very long sign duration', () => {
            const frames = createMockFrames(15);
            const longResult = calculateConfidence('hello', frames, 8000);
            const normalResult = calculateConfidence('hello', frames, 1500);

            expect(longResult.factors.signDuration).toBeLessThan(
                normalResult.factors.signDuration
            );
        });

        it('should penalize frames without landmarks', () => {
            const withLandmarks = createMockFrames(8, true);
            const withoutLandmarks = createMockFrames(8, false);

            const resultWith = calculateConfidence('pain', withLandmarks, 1500);
            const resultWithout = calculateConfidence('pain', withoutLandmarks, 1500);

            expect(resultWith.factors.handVisibility).toBeGreaterThan(
                resultWithout.factors.handVisibility
            );
        });

        it('should detect alternatives in translation', () => {
            const frames = createMockFrames(5);
            const result = calculateConfidence('pain or hurt', frames, 1000);

            expect(result.alternatives.length).toBeGreaterThan(0);
        });

        it('should provide explanation', () => {
            const frames = createMockFrames(5);
            const result = calculateConfidence('hello', frames, 1000);

            expect(result.explanation).toBeDefined();
            expect(typeof result.explanation).toBe('string');
            expect(result.explanation.length).toBeGreaterThan(10);
        });
    });

    describe('getConfidenceClass', () => {
        it('should return green for high confidence', () => {
            expect(getConfidenceClass('high')).toContain('green');
        });

        it('should return yellow for medium confidence', () => {
            expect(getConfidenceClass('medium')).toContain('yellow');
        });

        it('should return orange for low confidence', () => {
            expect(getConfidenceClass('low')).toContain('orange');
        });

        it('should return red for very-low confidence', () => {
            expect(getConfidenceClass('very-low')).toContain('red');
        });
    });

    describe('getConfidenceIcon', () => {
        it('should return check for high confidence', () => {
            expect(getConfidenceIcon('high')).toBe('✅');
        });

        it('should return yellow circle for medium confidence', () => {
            expect(getConfidenceIcon('medium')).toBe('🟡');
        });

        it('should return orange circle for low confidence', () => {
            expect(getConfidenceIcon('low')).toBe('🟠');
        });

        it('should return red circle for very-low confidence', () => {
            expect(getConfidenceIcon('very-low')).toBe('🔴');
        });
    });

    describe('ConfidenceFactors', () => {
        it('should include all required factors', () => {
            const frames = createMockFrames(5);
            const result = calculateConfidence('test', frames, 1000);

            expect(result.factors).toHaveProperty('geminiConfidence');
            expect(result.factors).toHaveProperty('handVisibility');
            expect(result.factors).toHaveProperty('signDuration');
            expect(result.factors).toHaveProperty('frameQuality');
            expect(result.factors).toHaveProperty('motionClarity');
        });

        it('should have factors in 0-100 range', () => {
            const frames = createMockFrames(8);
            const result = calculateConfidence('hello', frames, 1500);

            Object.values(result.factors).forEach((value) => {
                expect(value).toBeGreaterThanOrEqual(0);
                expect(value).toBeLessThanOrEqual(100);
            });
        });
    });
});
