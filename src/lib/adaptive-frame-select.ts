/**
 * Adaptive Frame Selection for ASL Translation
 * 
 * Selects key frames based on motion analysis rather than even distribution.
 * This improves ASL recognition by capturing:
 * - Sign start (hand entering frame)
 * - Peak motion moments (most distinctive hand positions)
 * - Sign end (final hold position)
 * 
 * Also removes near-duplicate frames to optimize API cost.
 */

import { HandFrame } from '@/hooks/use-hand-landmarker';

/**
 * Configuration for adaptive frame selection
 */
export interface FrameSelectionConfig {
    /** Maximum number of frames to return */
    maxFrames: number;
    /** Minimum velocity change to consider a frame "significant" (0-1) */
    significantMotionThreshold: number;
    /** Similarity threshold for duplicate detection (0-1) */
    duplicateThreshold: number;
    /** Whether to always include first/last frames */
    includeEndpoints: boolean;
    /** Use velocity-based selection vs even distribution */
    useAdaptiveSelection: boolean;
}

const DEFAULT_CONFIG: FrameSelectionConfig = {
    maxFrames: 8,
    significantMotionThreshold: 0.015,
    duplicateThreshold: 0.01,
    includeEndpoints: true,
    useAdaptiveSelection: true,
};

/**
 * Frame with motion metrics
 */
interface AnalyzedFrame {
    index: number;
    frame: HandFrame;
    velocity: number;
    acceleration: number;
    isKeyMoment: boolean;
}

/**
 * Calculate velocity between two landmark sets
 * Uses wrist position (landmark 0) as reference
 */
function calculateFrameVelocity(prev: HandFrame, curr: HandFrame): number {
    if (!prev.landmarks?.landmarks || !curr.landmarks?.landmarks) {
        return 0;
    }

    let totalVelocity = 0;
    const handsCount = Math.min(
        prev.landmarks.landmarks.length,
        curr.landmarks.landmarks.length
    );

    for (let h = 0; h < handsCount; h++) {
        const prevHand = prev.landmarks.landmarks[h];
        const currHand = curr.landmarks.landmarks[h];

        if (!prevHand?.[0] || !currHand?.[0]) continue;

        // Use wrist position for velocity calculation
        const dx = currHand[0].x - prevHand[0].x;
        const dy = currHand[0].y - prevHand[0].y;
        const dz = currHand[0].z - prevHand[0].z;

        totalVelocity += Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    return totalVelocity / Math.max(handsCount, 1);
}

/**
 * Check if two frames are similar (near-duplicates)
 */
function areFramesSimilar(a: HandFrame, b: HandFrame, threshold: number): boolean {
    if (!a.landmarks?.landmarks || !b.landmarks?.landmarks) {
        return false;
    }

    const handsA = a.landmarks.landmarks;
    const handsB = b.landmarks.landmarks;

    if (handsA.length !== handsB.length) {
        return false;
    }

    let totalDiff = 0;
    let count = 0;

    for (let h = 0; h < handsA.length; h++) {
        for (let l = 0; l < Math.min(handsA[h].length, handsB[h].length); l++) {
            const dx = handsA[h][l].x - handsB[h][l].x;
            const dy = handsA[h][l].y - handsB[h][l].y;
            totalDiff += Math.sqrt(dx * dx + dy * dy);
            count++;
        }
    }

    const avgDiff = count > 0 ? totalDiff / count : 0;
    return avgDiff < threshold;
}

/**
 * Analyze frames and compute motion metrics
 */
function analyzeFrames(frames: HandFrame[], config: FrameSelectionConfig): AnalyzedFrame[] {
    const analyzed: AnalyzedFrame[] = [];
    let prevVelocity = 0;

    for (let i = 0; i < frames.length; i++) {
        const velocity = i > 0 ? calculateFrameVelocity(frames[i - 1], frames[i]) : 0;
        const acceleration = velocity - prevVelocity;

        // A frame is a "key moment" if:
        // 1. It has significant motion (above threshold)
        // 2. OR there's a significant change in velocity (acceleration)
        const hasSignificantMotion = velocity > config.significantMotionThreshold;
        const hasSignificantAcceleration = Math.abs(acceleration) > config.significantMotionThreshold;

        analyzed.push({
            index: i,
            frame: frames[i],
            velocity,
            acceleration,
            isKeyMoment: hasSignificantMotion || hasSignificantAcceleration,
        });

        prevVelocity = velocity;
    }

    return analyzed;
}

/**
 * Select frames using adaptive motion-based algorithm
 */
function selectAdaptiveFrames(
    analyzed: AnalyzedFrame[],
    config: FrameSelectionConfig
): number[] {
    if (analyzed.length <= config.maxFrames) {
        return analyzed.map(a => a.index);
    }

    const selected: number[] = [];
    const { maxFrames, includeEndpoints, duplicateThreshold } = config;

    // Always include first frame
    if (includeEndpoints) {
        selected.push(0);
    }

    // Find key moment frames (sorted by importance: acceleration > velocity)
    const keyMoments = analyzed
        .filter(a => a.isKeyMoment && a.index !== 0 && a.index !== analyzed.length - 1)
        .sort((a, b) => {
            // Prioritize high acceleration (motion changes) over steady motion
            const aScore = Math.abs(a.acceleration) * 2 + a.velocity;
            const bScore = Math.abs(b.acceleration) * 2 + b.velocity;
            return bScore - aScore;
        });

    // Add key moments, avoiding duplicates
    for (const moment of keyMoments) {
        if (selected.length >= maxFrames - (includeEndpoints ? 1 : 0)) break;

        // Check if this frame is too similar to already selected frames
        const isDuplicate = selected.some(idx =>
            areFramesSimilar(
                analyzed[idx].frame,
                moment.frame,
                duplicateThreshold
            )
        );

        if (!isDuplicate) {
            selected.push(moment.index);
        }
    }

    // Fill remaining slots with evenly distributed frames
    const remaining = maxFrames - selected.length - (includeEndpoints ? 1 : 0);
    if (remaining > 0) {
        const step = analyzed.length / (remaining + 1);
        for (let i = 1; i <= remaining; i++) {
            const idx = Math.round(i * step);
            if (!selected.includes(idx) && idx < analyzed.length - 1) {
                selected.push(idx);
            }
        }
    }

    // Always include last frame
    if (includeEndpoints && !selected.includes(analyzed.length - 1)) {
        selected.push(analyzed.length - 1);
    }

    // Sort by index order
    return selected.sort((a, b) => a - b);
}

/**
 * Select evenly distributed frames (fallback)
 */
function selectEvenFrames(totalFrames: number, maxFrames: number): number[] {
    if (totalFrames <= maxFrames) {
        return Array.from({ length: totalFrames }, (_, i) => i);
    }

    const indices: number[] = [];
    const step = (totalFrames - 1) / (maxFrames - 1);

    for (let i = 0; i < maxFrames; i++) {
        indices.push(Math.round(i * step));
    }

    return indices;
}

/**
 * Main adaptive frame selection function
 * 
 * @param frames - Array of captured hand frames
 * @param config - Configuration options (optional)
 * @returns Array of selected frame indices, sorted chronologically
 */
export function selectKeyFramesAdaptive(
    frames: HandFrame[],
    config: Partial<FrameSelectionConfig> = {}
): number[] {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };

    if (frames.length === 0) {
        return [];
    }

    if (frames.length <= mergedConfig.maxFrames) {
        return frames.map((_, i) => i);
    }

    // Use adaptive selection if enabled and we have landmark data
    const hasLandmarks = frames.some(f => f.landmarks?.landmarks?.length);

    if (mergedConfig.useAdaptiveSelection && hasLandmarks) {
        const analyzed = analyzeFrames(frames, mergedConfig);
        return selectAdaptiveFrames(analyzed, mergedConfig);
    }

    // Fallback to even distribution
    return selectEvenFrames(frames.length, mergedConfig.maxFrames);
}

/**
 * Get frame content for selected indices
 */
export function getSelectedFrames(
    frames: HandFrame[],
    indices: number[]
): HandFrame[] {
    return indices
        .filter(i => i >= 0 && i < frames.length)
        .map(i => frames[i]);
}
