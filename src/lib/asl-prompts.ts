/**
 * ASL Prompt Variations
 * 
 * Different prompt strategies for Gemini Vision ASL translation.
 * Use these for A/B testing to find optimal accuracy.
 */

export type PromptVariant = 'baseline' | 'minimal' | 'medical' | 'visual' | 'twostage' | 'confidence' | 'fewshot';

/**
 * Baseline prompt - current production version
 */
const PROMPT_BASELINE = `You are an ASL (American Sign Language) interpreter assistant for a healthcare communication app.

Your task is to analyze video frames showing a person signing in ASL and translate their signs to English.

IMPORTANT GUIDELINES:
1. Focus on identifying the ASL sign being made based on hand positions, shapes, and movements
2. If you can identify the sign, respond with JUST the English word or short phrase
3. If you cannot identify the sign clearly, respond with "[unclear]"
4. Never make up or guess medical diagnoses - only translate what is signed
5. Common healthcare-related ASL signs include: pain, hurt, help, medicine, doctor, hospital, sick, better, worse, head, stomach, heart, breathing, dizzy, tired
6. DISTINCTION: "Sick" (middle finger to forehead/stomach) vs "Pain" (index fingers twisting near location). look closely at finger shape.

RESPONSE FORMAT:
- Single word or short phrase only
- No explanations or caveats
- Example responses: "pain", "my head hurts", "I need help", "[unclear]"`;

/**
 * V1: Minimal prompt - optimized for speed
 */
const PROMPT_MINIMAL = `Identify the ASL sign in these frames. Respond with only the English word. If unclear, say "[unclear]".`;

/**
 * V2: Medical vocabulary emphasis
 */
const PROMPT_MEDICAL = `You are an ASL interpreter in a medical context.
Analyze the video frames to identify the specific sign.

DISTINCTIONS:
- "Pain" vs "Sick": "Sick" typically uses the middle finger touching the forehead and stomach. "Pain" uses index fingers touching/twisting near the specific body part.
- "Help": Flat hand with thumbs up on top, lifting up.
- "Doctor": Tips of fingers on one hand tapping the wrist of the other.

CONTEXT:
 The patient is likely communicating about:
- Symptoms: pain, hurt, ache, sick, dizzy, nausea, tired
- Body parts: head, chest, stomach, heart, back, arm, leg
- Requests: help, doctor, medicine, emergency

Respond with ONLY the English translation.
If the sign implies pain in a specific area (e.g. head + pain), translate as "headache" or "pain in head".
If you are unsure, respond with "[unclear]".`;

/**
 * V3: Visual description focus
 */
const PROMPT_VISUAL = `Describe what you see in these ASL signing frames:
1. Hand shape (flat, fist, pointing, spread fingers, etc.)
2. Hand position relative to body (head, chest, stomach, neutral)
3. Motion direction (up, down, circular, tapping)

Then provide the most likely ASL word/phrase based on these observations.
Format: [description] --> [translation]
If uncertain, respond: [description] --> [unclear]`;

/**
 * V4: Two-stage analysis (chain of thought)
 */
const PROMPT_TWOSTAGE = `STEP 1: Describe the hand movements you observe:
- Starting position
- Motion/movement
- Ending position
- Facial expression (if visible)

STEP 2: Based on your observations, what ASL sign is being made?

Respond in this format:
OBSERVATION: [your observations]
TRANSLATION: [single word or phrase, or "[unclear]"]`;

/**
 * V5: Confidence-weighted response
 */
const PROMPT_CONFIDENCE = `Analyze these ASL signing frames and provide:
1. Your translation (single word or phrase)
2. Confidence level (1-5, where 5 is certain)

Format: TRANSLATION | CONFIDENCE
Examples: "pain | 4", "help | 5", "[unclear] | 1"

Only translate what you clearly see. Never guess.`;

/**
 * V6: Few-shot examples
 */
const PROMPT_FEWSHOT = `Translate the ASL sign shown in these frames.

Examples of ASL signs and their meanings:
- Hand tapping forehead twice → "headache"
- Fist on chest, circular motion → "sorry"
- Flat hand rubbing stomach → "stomach"
- Index fingers touching/twisting near body part → "pain"
- Middle finger touching forehead and stomach → "sick"
- S-hand nodding → "yes"
- Two fingers closing to thumb → "no"

Now analyze the provided frames and respond with just the English word or phrase.
If the sign is unclear, respond with "[unclear]".`;

/**
 * All prompts indexed by variant name
 */
export const ASL_PROMPTS: Record<PromptVariant, string> = {
    baseline: PROMPT_BASELINE,
    minimal: PROMPT_MINIMAL,
    medical: PROMPT_MEDICAL,
    visual: PROMPT_VISUAL,
    twostage: PROMPT_TWOSTAGE,
    confidence: PROMPT_CONFIDENCE,
    fewshot: PROMPT_FEWSHOT,
};

/**
 * Get prompt by variant name
 */
export function getPrompt(variant: PromptVariant): string {
    return ASL_PROMPTS[variant] || PROMPT_BASELINE;
}

/**
 * Parse response based on prompt variant
 * Some variants have structured output that needs parsing
 */
export function parseResponse(variant: PromptVariant, response: string): {
    translation: string;
    confidence?: number;
    observation?: string;
} {
    const trimmed = response.trim();

    switch (variant) {
        case 'visual': {
            // Format: [description] --> [translation]
            const match = trimmed.match(/.*-->\s*(.+)/);
            return {
                translation: match ? match[1].trim() : trimmed,
                observation: trimmed.split('-->')[0]?.trim(),
            };
        }

        case 'twostage': {
            // Format: OBSERVATION: ... TRANSLATION: ...
            const transMatch = trimmed.match(/TRANSLATION:\s*(.+)/i);
            // Use split approach instead of 's' flag for ES2015 compatibility
            const obsSection = trimmed.split(/TRANSLATION:/i)[0] || '';
            const obsMatch = obsSection.match(/OBSERVATION:\s*([\s\S]+)/i);
            return {
                translation: transMatch ? transMatch[1].trim() : trimmed,
                observation: obsMatch ? obsMatch[1].trim() : undefined,
            };
        }

        case 'confidence': {
            // Format: TRANSLATION | CONFIDENCE
            const parts = trimmed.split('|').map(p => p.trim());
            return {
                translation: parts[0] || trimmed,
                confidence: parts[1] ? parseInt(parts[1], 10) : undefined,
            };
        }

        default:
            return { translation: trimmed };
    }
}
