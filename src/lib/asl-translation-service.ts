import { GoogleGenerativeAI } from "@google/generative-ai";
import { HandFrame } from "@/hooks/use-hand-landmarker";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// Use Gemini Pro Vision for image analysis
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
});

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
}

/**
 * Translate ASL signs from captured video frames using Gemini Vision
 */
export async function translateASLFrames(frames: HandFrame[]): Promise<ASLTranslationResult> {
    if (!frames || frames.length === 0) {
        return {
            translation: '[no frames]',
            confidence: 'unclear',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
    }

    try {
        // Select key frames (first, middle, last) to send to Gemini
        // This reduces API payload while capturing the sign's progression
        const keyFrameIndices = selectKeyFrames(frames.length, 5);
        const keyFrames = keyFrameIndices.map(i => frames[i]);

        // Prepare image parts for Gemini
        const imageParts = keyFrames.map((frame, index) => ({
            inlineData: {
                mimeType: "image/jpeg",
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

        // Determine confidence based on response
        let confidence: 'high' | 'medium' | 'low' | 'unclear' = 'medium';
        if (text === '[unclear]' || text.toLowerCase().includes('unclear') || text.toLowerCase().includes('cannot')) {
            confidence = 'unclear';
        } else if (text.split(' ').length <= 3) {
            confidence = 'high'; // Short, confident responses
        }

        console.log(`🤟 ASL Translation: "${text}" (confidence: ${confidence})`);

        return {
            translation: text,
            confidence,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

    } catch (error: any) {
        console.error('❌ ASL Translation error:', error);

        // Handle rate limiting
        if (error.message?.includes('429') || error.message?.includes('quota')) {
            return {
                translation: '[rate limited - try again]',
                confidence: 'unclear',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
        }

        return {
            translation: '[translation error]',
            confidence: 'unclear',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
