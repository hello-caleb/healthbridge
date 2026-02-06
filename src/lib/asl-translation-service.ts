import { GoogleGenerativeAI } from "@google/generative-ai";
import { HandFrame } from "@/hooks/use-hand-landmarker";
import { selectKeyFramesAdaptive, getSelectedFrames } from "./adaptive-frame-select";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * ASL Translation Configuration
 * Adjust these settings to optimize accuracy vs. speed tradeoff
 */
export interface ASLConfig {
    /** Number of frames to send to Gemini (5, 8, 10, or 15) */
    maxFrames: 5 | 8 | 10 | 15;
    /** Gemini model to use */
    model: 'gemini-2.0-flash' | 'gemini-2.5-flash' | 'gemini-2.5-pro';
    /** JPEG quality (0-1) for frame compression */
    imageQuality: number;
    /** Enable verbose logging */
    verbose: boolean;
    /** Use adaptive (motion-based) frame selection instead of even distribution */
    useAdaptiveSelection: boolean;
}

export const DEFAULT_ASL_CONFIG: ASLConfig = {
    maxFrames: 8, // Increased from 5 for better accuracy
    model: 'gemini-2.0-flash',
    imageQuality: 0.7,
    verbose: false,
    useAdaptiveSelection: true, // Use motion-based frame selection
};

export const ACCURACY_ASL_CONFIG: ASLConfig = {
    maxFrames: 15,
    model: 'gemini-2.5-flash',
    imageQuality: 0.85,
    verbose: true,
    useAdaptiveSelection: true,
};

export const FAST_ASL_CONFIG: ASLConfig = {
    maxFrames: 5,
    model: 'gemini-2.0-flash',
    imageQuality: 0.6,
    verbose: false,
    useAdaptiveSelection: false, // Even distribution for speed
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

// System prompt for ASL interpretation
const ASL_SYSTEM_PROMPT = `You are an ASL (American Sign Language) interpreter assistant for a healthcare communication app.

Your task is to analyze video frames showing a person signing in ASL and translate their signs to English.

IMPORTANT GUIDELINES:
1. Focus on identifying the ASL sign being made based on hand positions, shapes, and movements
2. If you can identify the sign, respond with JUST the English word or short phrase
3. If you cannot identify the sign clearly, respond with "[unclear]"
4. Never make up or guess medical diagnoses - only translate what is signed
5. Common healthcare-related ASL signs include: pain, hurt, help, medicine, doctor, hospital, sick, better, worse, head, stomach, heart, breathing, dizzy, tired

RESPONSE FORMAT:
- Single word or short phrase only
- No explanations or caveats
- Example responses: "pain", "my head hurts", "I need help", "[unclear]"`;

export interface ASLTranslationResult {
    translation: string;
    confidence: 'high' | 'medium' | 'low' | 'unclear';
    timestamp: string;
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
        const prompt = `${ASL_SYSTEM_PROMPT}

I'm showing you ${keyFrames.length} frames from a video of someone signing in ASL. The frames are in chronological order showing the progression of the sign.

What ASL sign or phrase is being made? Remember to respond with just the English translation.`;

        // Call Gemini Vision
        const result = await model.generateContent([
            prompt,
            ...imageParts,
        ]);

        const response = result.response;
        const text = response.text().trim();
        const latencyMs = Date.now() - startTime;

        // Determine confidence based on response
        let confidence: 'high' | 'medium' | 'low' | 'unclear' = 'medium';
        if (text === '[unclear]' || text.toLowerCase().includes('unclear') || text.toLowerCase().includes('cannot')) {
            confidence = 'unclear';
        } else if (text.split(' ').length <= 3) {
            confidence = 'high'; // Short, confident responses
        }

        if (config.verbose) {
            console.log(`🤟 ASL Translation: "${text}" (confidence: ${confidence}, ${keyFrames.length} frames, ${latencyMs}ms, ${config.model})`);
        }

        return {
            translation: text,
            confidence,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            latencyMs,
            framesUsed: keyFrames.length,
            modelUsed: config.model,
        };

    } catch (error: any) {
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
