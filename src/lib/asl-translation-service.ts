import { GoogleGenerativeAI } from "@google/generative-ai";
import { HandFrame } from "@/hooks/use-hand-landmarker";
import { selectKeyFramesAdaptive, getSelectedFrames } from "./adaptive-frame-select";
import { ApiUsageTracker } from "./api-usage-tracker";
import { getPrompt, parseResponse, PromptVariant } from "./asl-prompts";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * ASL Translation Configuration
 * Adjust these settings to optimize accuracy vs. speed tradeoff
 */
export interface ASLConfig {
    /** Number of frames to send to Gemini */
    maxFrames: number;
    /** Gemini model to use */
    model: 'gemini-3-flash-preview' | 'gemini-3-pro-preview';
    /** JPEG quality (0-1) for frame compression */
    imageQuality: number;
    /** Enable verbose logging */
    verbose: boolean;
    /** Use adaptive (motion-based) frame selection instead of even distribution */
    useAdaptiveSelection: boolean;
    /** Prompt strategy to use */
    promptVariant: PromptVariant;
}

export const DEFAULT_ASL_CONFIG: ASLConfig = {
    maxFrames: 12, // Increased to 12 for better sampling of dynamic signs
    model: 'gemini-3-flash-preview',
    imageQuality: 0.7,
    verbose: false,
    useAdaptiveSelection: true,
    promptVariant: 'baseline',
};

export const ACCURACY_ASL_CONFIG: ASLConfig = {
    maxFrames: 20, // High frame count for complex fingerspelling
    model: 'gemini-3-pro-preview',
    imageQuality: 0.85,
    verbose: true,
    useAdaptiveSelection: true,
    promptVariant: 'confidence',
};

export const FAST_ASL_CONFIG: ASLConfig = {
    maxFrames: 5,
    model: 'gemini-3-flash-preview',
    imageQuality: 0.6,
    verbose: false,
    useAdaptiveSelection: false,
    promptVariant: 'minimal',
};

// Current active configuration - can be changed at runtime
let currentConfig: ASLConfig = { ...DEFAULT_ASL_CONFIG };

/**
 * Update the active ASL configuration
 */
export function setASLConfig(config: Partial<ASLConfig>): void {
    currentConfig = { ...currentConfig, ...config };
    console.log('🔧 ASL Config updated:', currentConfig);
}

/**
 * Get the current active configuration
 */
export function getASLConfig(): ASLConfig {
    return { ...currentConfig };
}

// ============================================
// RATE LIMITING - Prevent excessive API calls
// ============================================

interface RateLimitState {
    lastRequestTime: number;
    requestsInLastMinute: number[];
    isRequestInProgress: boolean;
}

const rateLimitState: RateLimitState = {
    lastRequestTime: 0,
    requestsInLastMinute: [],
    isRequestInProgress: false,
};

/** Minimum time between API requests (ms) */
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds

/** Maximum requests per minute */
const MAX_REQUESTS_PER_MINUTE = 10;

/**
 * Check if we can make a new API request
 * Returns { allowed: boolean, reason?: string, waitMs?: number }
 */
function checkRateLimit(): { allowed: boolean; reason?: string; waitMs?: number } {
    const now = Date.now();

    // Clean up old timestamps (older than 1 minute)
    rateLimitState.requestsInLastMinute = rateLimitState.requestsInLastMinute.filter(
        t => now - t < 60000
    );

    // Check if request is already in progress
    if (rateLimitState.isRequestInProgress) {
        return { allowed: false, reason: 'Request already in progress' };
    }

    // Check minimum interval
    const timeSinceLastRequest = now - rateLimitState.lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        return {
            allowed: false,
            reason: 'Too soon after last request',
            waitMs: MIN_REQUEST_INTERVAL - timeSinceLastRequest
        };
    }

    // Check requests per minute limit
    if (rateLimitState.requestsInLastMinute.length >= MAX_REQUESTS_PER_MINUTE) {
        const oldestRequest = rateLimitState.requestsInLastMinute[0];
        const waitMs = 60000 - (now - oldestRequest);
        return {
            allowed: false,
            reason: `Rate limit: ${MAX_REQUESTS_PER_MINUTE}/minute exceeded`,
            waitMs
        };
    }

    return { allowed: true };
}

/**
 * Record that a request was made
 */
function recordRequest(): void {
    const now = Date.now();
    rateLimitState.lastRequestTime = now;
    rateLimitState.requestsInLastMinute.push(now);
    rateLimitState.isRequestInProgress = true;
}

/**
 * Mark request as complete
 */
function requestComplete(): void {
    rateLimitState.isRequestInProgress = false;
}

/**
 * Get rate limit status for UI display
 */
export function getRateLimitStatus(): {
    requestsRemaining: number;
    nextRequestIn: number;
    isThrottled: boolean;
} {
    const now = Date.now();
    rateLimitState.requestsInLastMinute = rateLimitState.requestsInLastMinute.filter(
        t => now - t < 60000
    );

    const requestsRemaining = MAX_REQUESTS_PER_MINUTE - rateLimitState.requestsInLastMinute.length;
    const timeSinceLastRequest = now - rateLimitState.lastRequestTime;
    const nextRequestIn = Math.max(0, MIN_REQUEST_INTERVAL - timeSinceLastRequest);

    return {
        requestsRemaining,
        nextRequestIn,
        isThrottled: requestsRemaining <= 0 || rateLimitState.isRequestInProgress,
    };
}

// System prompt for ASL interpretation
// Now using dynamic prompts from asl-prompts.ts
// const ASL_SYSTEM_PROMPT = ... (removed)

export interface ASLTranslationResult {
    translation: string;
    confidence: 'high' | 'medium' | 'low' | 'unclear';
    timestamp: string;
    description?: string; // New field for CoT
    /** Latency in milliseconds */
    latencyMs?: number;
    /** Number of frames used */
    framesUsed?: number;
    /** Model used for translation */
    modelUsed?: string;
}

/**
 * Translate ASL signs from captured video frames using Gemini Vision
 * @param frames Array of captured hand frames
 * @param configOverride Optional config to override current settings (for A/B testing)
 */
export async function translateASLFrames(
    frames: HandFrame[],
    configOverride?: Partial<ASLConfig>
): Promise<ASLTranslationResult> {
    const startTime = Date.now();
    const config = { ...currentConfig, ...configOverride };

    // Create model with specified configuration
    const model = genAI.getGenerativeModel({
        model: config.model,
    });

    if (!frames || frames.length === 0) {
        return {
            translation: '[no frames]',
            confidence: 'unclear',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            latencyMs: Date.now() - startTime,
            framesUsed: 0,
            modelUsed: config.model,
        };
    }

    // Check rate limit before making API call
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
        const status = getRateLimitStatus();
        console.warn(`⚠️ Rate limited: ${rateLimitCheck.reason}. Remaining: ${status.requestsRemaining}/min`);
        return {
            translation: `[throttled - ${status.requestsRemaining} calls left]`,
            confidence: 'unclear',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            latencyMs: Date.now() - startTime,
            framesUsed: 0,
            modelUsed: config.model,
        };
    }

    // Check daily usage limit
    if (!ApiUsageTracker.checkAvailability('asl')) {
        console.warn('⚠️ Daily API limit reached');
        return {
            translation: '[daily limit reached]',
            confidence: 'unclear',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            latencyMs: Date.now() - startTime,
            framesUsed: 0,
            modelUsed: config.model,
        };
    }

    // Record this request (both in-memory rate limiter and persistent tracker)
    recordRequest();
    ApiUsageTracker.increment('asl');

    try {
        // Select key frames using adaptive or even distribution
        const keyFrameIndices = selectKeyFramesAdaptive(frames, {
            maxFrames: config.maxFrames,
            useAdaptiveSelection: config.useAdaptiveSelection,
        });
        const keyFrames = getSelectedFrames(frames, keyFrameIndices);

        if (config.verbose) {
            console.log(`📸 Selected ${keyFrameIndices.length} frames from ${frames.length} total`);
            console.log(`   Indices: [${keyFrameIndices.join(', ')}]`);
        }

        // Prepare image parts for Gemini
        const imageParts = keyFrames.map((frame) => ({
            inlineData: {
                mimeType: "image/jpeg" as const,
                data: frame.imageData.replace(/^data:image\/jpeg;base64,/, ''),
            },
        }));

        // Create the prompt
        const systemPrompt = getPrompt(config.promptVariant || 'baseline');
        const prompt = `${systemPrompt}

I'm showing you ${keyFrames.length} frames from a video of someone signing in ASL. The frames are in chronological order showing the progression of the sign.`;

        // Call Gemini Vision
        const result = await model.generateContent([
            prompt,
            ...imageParts,
        ]);

        const response = result.response;
        const text = response.text().trim();
        const latencyMs = Date.now() - startTime;

        // Parse response based on prompt variant
        const parsed = parseResponse(config.promptVariant || 'baseline', text);

        const translation = parsed.translation || '[unclear]';
        const description = parsed.observation || '';
        let confidence: 'high' | 'medium' | 'low' | 'unclear' =
            parsed.confidence ? (parsed.confidence >= 4 ? 'high' : parsed.confidence >= 2 ? 'medium' : 'low') : 'medium';

        // Try to recover JSON if the prompt was the original baseline (which asks for JSON)
        // This is back-compat for the original hardcoded prompt style if we ever use it
        if (config.promptVariant === 'baseline' && text.startsWith('{')) {
            try {
                const json = JSON.parse(text);
                if (json.sign) {
                    return {
                        translation: json.sign,
                        confidence: json.confidence || 'medium',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        description: json.description,
                        latencyMs,
                        framesUsed: keyFrames.length,
                        modelUsed: config.model,
                    };
                }
            } catch (e) {
                // ignore json parse error
            }
        }

        // Additional safety checks
        if (translation.toLowerCase().includes('unclear')) {
            confidence = 'unclear';
        }

        if (config.verbose) {
            console.log(`🤟 ASL: "${translation}" (${confidence}) - ${description}`);
        }

        // Mark request complete for rate limiting
        requestComplete();

        return {
            translation,
            confidence,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            description, // Return description for debugging/UI
            latencyMs,
            framesUsed: keyFrames.length,
            modelUsed: config.model,
        };

    } catch (error: any) {
        // Mark request complete even on error
        requestComplete();

        const latencyMs = Date.now() - startTime;
        console.error('❌ ASL Translation error:', error);

        // Handle rate limiting
        if (error.message?.includes('429') || error.message?.includes('quota')) {
            return {
                translation: '[rate limited - try again]',
                confidence: 'unclear',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                latencyMs,
                framesUsed: 0,
                modelUsed: config.model,
            };
        }

        return {
            translation: '[translation error]',
            confidence: 'unclear',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            latencyMs,
            framesUsed: 0,
            modelUsed: config.model,
        };
    }
}

/**
 * Select evenly distributed key frames from a sequence
 */
function selectKeyFrames(totalFrames: number, maxFrames: number): number[] {
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
 * Common ASL healthcare vocabulary for reference
 * (Can be used for prompt enhancement or local validation)
 */
export const ASL_HEALTHCARE_VOCABULARY = [
    'pain', 'hurt', 'ache',
    'help', 'emergency', 'call',
    'doctor', 'nurse', 'hospital',
    'medicine', 'pill', 'injection',
    'sick', 'fever', 'cold', 'flu',
    'head', 'stomach', 'chest', 'back', 'arm', 'leg',
    'heart', 'breathing', 'blood',
    'dizzy', 'tired', 'weak', 'nauseous',
    'better', 'worse', 'same',
    'yes', 'no', 'maybe',
    'understand', 'repeat', 'slow down',
    'thank you', 'please', 'sorry',
];
