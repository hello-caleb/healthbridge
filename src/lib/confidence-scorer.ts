/**
 * Confidence Scoring for ASL Translations
 * 
 * Provides nuanced 0-100 confidence scoring by factoring in:
 * - Gemini API response confidence indicators
 * - Hand visibility and detection quality
 * - Sign duration and frame quality
 * - Alternative interpretation likelihood
 */

import { HandFrame } from '@/hooks/use-hand-landmarker';

/**
 * Detailed confidence result
 */
export interface ConfidenceResult {
    /** Overall confidence score (0-100) */
    score: number;
    /** Confidence level category */
    level: 'high' | 'medium' | 'low' | 'very-low';
    /** Breakdown of contributing factors */
    factors: ConfidenceFactors;
    /** Alternative interpretations if confidence is low */
    alternatives: string[];
    /** Human-readable explanation */
    explanation: string;
}

/**
 * Individual confidence factors
 */
export interface ConfidenceFactors {
    /** Score based on Gemini's response certainty (0-100) */
    geminiConfidence: number;
    /** Score based on hand visibility (0-100) */
    handVisibility: number;
    /** Score based on sign duration appropriateness (0-100) */
    signDuration: number;
    /** Score based on frame quality (0-100) */
    frameQuality: number;
    /** Score based on motion clarity (0-100) */
    motionClarity: number;
}

/**
 * Configuration for confidence scoring
 */
export interface ConfidenceConfig {
    /** Weight for Gemini response confidence */
    geminiWeight: number;
    /** Weight for hand visibility */
    visibilityWeight: number;
    /** Weight for sign duration */
    durationWeight: number;
    /** Weight for frame quality */
    frameQualityWeight: number;
    /** Weight for motion clarity */
    motionWeight: number;
    /** Ideal sign duration range (ms) */
    idealDurationRange: { min: number; max: number };
    /** Minimum frames for good quality */
    minFramesForQuality: number;
}

const DEFAULT_CONFIG: ConfidenceConfig = {
    geminiWeight: 0.4,       // 40% weight on Gemini response
    visibilityWeight: 0.2,   // 20% weight on hand visibility
    durationWeight: 0.15,    // 15% weight on duration
    frameQualityWeight: 0.1, // 10% weight on frame quality
    motionWeight: 0.15,      // 15% weight on motion clarity
    idealDurationRange: { min: 800, max: 3000 },
    minFramesForQuality: 6,
};

/**
 * Analyze Gemini response for confidence indicators
 */
function analyzeGeminiResponse(translation: string): { score: number; alternatives: string[] } {
    const lower = translation.toLowerCase().trim();

    // Clear failure indicators = very low confidence
    if (lower.includes('[unclear]') || lower === '[unclear]') {
        return { score: 10, alternatives: [] };
    }
    if (lower.includes('[translation error]') || lower.includes('[no frames]')) {
        return { score: 0, alternatives: [] };
    }
    if (lower.includes('[rate limited]')) {
        return { score: 0, alternatives: [] };
    }

    // Check for hedging language (indicates lower confidence)
    const hedgingPhrases = [
        'might be', 'could be', 'possibly', 'maybe', 'appears to be',
        'looks like', 'seems like', 'uncertain', 'not sure', 'or'
    ];

    const hedgingCount = hedgingPhrases.filter(phrase => lower.includes(phrase)).length;

    // Check for question marks (uncertainty)
    const hasQuestion = translation.includes('?');

    // Check for alternative suggestions in response
    const alternatives: string[] = [];
    const orMatch = translation.match(/(.+?)\s+or\s+(.+)/i);
    if (orMatch) {
        alternatives.push(orMatch[1].trim(), orMatch[2].trim());
    }

    // Check for very short translations (might be single word = good)
    // vs very long translations (might indicate uncertainty)
    const wordCount = translation.split(/\s+/).length;

    // Calculate base score
    let score = 85; // Start optimistic

    // Deduct for hedging
    score -= hedgingCount * 15;

    // Deduct for question marks
    if (hasQuestion) score -= 20;

    // Deduct for alternatives (indicates uncertainty)
    if (alternatives.length > 0) score -= 10;

    // Bonus for clean, short translations
    if (wordCount <= 3 && hedgingCount === 0) {
        score = Math.min(100, score + 10);
    }

    // Deduct for very long translations
    if (wordCount > 10) score -= 15;

    return {
        score: Math.max(0, Math.min(100, score)),
        alternatives
    };
}

/**
 * Calculate hand visibility score from frames
 */
function calculateHandVisibility(frames: HandFrame[]): number {
    if (frames.length === 0) return 0;

    let framesWithHands = 0;
    let totalLandmarkConfidence = 0;
    let landmarkCount = 0;

    for (const frame of frames) {
        if (frame.landmarks?.landmarks && frame.landmarks.landmarks.length > 0) {
            framesWithHands++;

            // Check landmark confidence if available (not all MediaPipe results include this)
            // Assume good visibility if landmarks are present
            totalLandmarkConfidence += 0.8; // Default high visibility when detected
            landmarkCount++;
        }
    }

    // Score based on percentage of frames with hands
    const visibilityRate = framesWithHands / frames.length;
    const avgConfidence = landmarkCount > 0 ? totalLandmarkConfidence / landmarkCount : 0;

    return Math.round(visibilityRate * 0.6 * 100 + avgConfidence * 0.4 * 100);
}

/**
 * Calculate duration score (penalize too short or too long)
 */
function calculateDurationScore(
    signDurationMs: number,
    idealRange: { min: number; max: number }
): number {
    if (signDurationMs < idealRange.min * 0.5) {
        // Very short = likely incomplete
        return 30;
    }
    if (signDurationMs < idealRange.min) {
        // Slightly short
        return 60;
    }
    if (signDurationMs > idealRange.max * 2) {
        // Very long = might be multiple signs
        return 40;
    }
    if (signDurationMs > idealRange.max) {
        // Slightly long
        return 70;
    }

    // Within ideal range
    return 100;
}

/**
 * Calculate frame quality score
 */
function calculateFrameQuality(frames: HandFrame[], minFrames: number): number {
    if (frames.length === 0) return 0;
    if (frames.length < minFrames / 2) return 30;
    if (frames.length < minFrames) return 60;

    // Check for frame data quality (non-empty base64)
    const validFrames = frames.filter(f =>
        f.imageData && f.imageData.length > 1000 // Reasonable image size
    );

    const validRate = validFrames.length / frames.length;

    // Bonus for more frames (up to a point)
    const frameBonus = Math.min(frames.length / minFrames, 1.5);

    return Math.round(Math.min(100, validRate * 80 * frameBonus));
}

/**
 * Calculate motion clarity score
 */
function calculateMotionClarity(frames: HandFrame[]): number {
    if (frames.length < 2) return 50; // Can't assess motion

    let hasSignificantMotion = false;
    let motionVariance = 0;

    for (let i = 1; i < frames.length; i++) {
        const prev = frames[i - 1].landmarks?.landmarks;
        const curr = frames[i].landmarks?.landmarks;

        if (!prev || !curr || prev.length === 0 || curr.length === 0) continue;

        // Calculate motion between frames using wrist position
        for (let h = 0; h < Math.min(prev.length, curr.length); h++) {
            if (!prev[h]?.[0] || !curr[h]?.[0]) continue;

            const dx = curr[h][0].x - prev[h][0].x;
            const dy = curr[h][0].y - prev[h][0].y;
            const motion = Math.sqrt(dx * dx + dy * dy);

            if (motion > 0.01) hasSignificantMotion = true;
            motionVariance += motion;
        }
    }

    // Normalize motion variance
    const avgMotion = motionVariance / (frames.length - 1);

    // We want some motion (signing) but not too erratic
    if (!hasSignificantMotion) {
        return 40; // No motion = might be holding still too long
    }

    if (avgMotion > 0.1) {
        return 60; // Too much motion = might be unclear
    }

    return 90; // Good motion level
}

/**
 * Get confidence level from score
 */
function getConfidenceLevel(score: number): 'high' | 'medium' | 'low' | 'very-low' {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'low';
    return 'very-low';
}

/**
 * Generate human-readable explanation
 */
function generateExplanation(
    score: number,
    factors: ConfidenceFactors,
    translation: string
): string {
    if (score >= 85) {
        return `High confidence in "${translation}" - clear hand visibility and motion.`;
    }

    if (score >= 70) {
        return `Good confidence in "${translation}" - minor uncertainty factors detected.`;
    }

    // Find the weakest factor
    const weakestFactor = Object.entries(factors)
        .sort(([, a], [, b]) => a - b)[0];

    const factorNames: Record<keyof ConfidenceFactors, string> = {
        geminiConfidence: 'translation certainty',
        handVisibility: 'hand visibility',
        signDuration: 'sign duration',
        frameQuality: 'frame quality',
        motionClarity: 'motion clarity',
    };

    if (score >= 50) {
        return `Moderate confidence - ${factorNames[weakestFactor[0] as keyof ConfidenceFactors]} could be improved.`;
    }

    return `Low confidence - please sign again with better lighting and hand visibility.`;
}

/**
 * Main confidence scoring function
 * 
 * @param translation - The translation result from Gemini
 * @param frames - The captured hand frames
 * @param signDurationMs - Duration of the sign in milliseconds
 * @param config - Optional configuration overrides
 * @returns Detailed confidence result
 */
export function calculateConfidence(
    translation: string,
    frames: HandFrame[],
    signDurationMs: number,
    config: Partial<ConfidenceConfig> = {}
): ConfidenceResult {
    const cfg = { ...DEFAULT_CONFIG, ...config };

    // Calculate individual factors
    const { score: geminiConfidence, alternatives } = analyzeGeminiResponse(translation);
    const handVisibility = calculateHandVisibility(frames);
    const signDuration = calculateDurationScore(signDurationMs, cfg.idealDurationRange);
    const frameQuality = calculateFrameQuality(frames, cfg.minFramesForQuality);
    const motionClarity = calculateMotionClarity(frames);

    const factors: ConfidenceFactors = {
        geminiConfidence,
        handVisibility,
        signDuration,
        frameQuality,
        motionClarity,
    };

    // Calculate weighted overall score
    const score = Math.round(
        geminiConfidence * cfg.geminiWeight +
        handVisibility * cfg.visibilityWeight +
        signDuration * cfg.durationWeight +
        frameQuality * cfg.frameQualityWeight +
        motionClarity * cfg.motionWeight
    );

    const level = getConfidenceLevel(score);
    const explanation = generateExplanation(score, factors, translation);

    return {
        score,
        level,
        factors,
        alternatives,
        explanation,
    };
}

/**
 * Get CSS class for confidence level (for UI)
 */
export function getConfidenceClass(level: ConfidenceResult['level']): string {
    switch (level) {
        case 'high': return 'text-green-500';
        case 'medium': return 'text-yellow-500';
        case 'low': return 'text-orange-500';
        case 'very-low': return 'text-red-500';
        default: return 'text-gray-500';
    }
}

/**
 * Get confidence icon emoji
 */
export function getConfidenceIcon(level: ConfidenceResult['level']): string {
    switch (level) {
        case 'high': return '✅';
        case 'medium': return '🟡';
        case 'low': return '🟠';
        case 'very-low': return '🔴';
        default: return '⚪';
    }
}
