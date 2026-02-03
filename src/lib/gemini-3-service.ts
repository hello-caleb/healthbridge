import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    term: { type: SchemaType.STRING },
                    definition: { type: SchemaType.STRING },
                },
                required: ["term", "definition"],
            },
        },
    },
    // @ts-ignore - dangerouslyAllowBrowser is valid but missing from type definitions in 0.24.1
}, { dangerouslyAllowBrowser: true });

export type MedicalTerm = {
    term: string;
    definition: string;
    timestamp?: string;
};

export async function detectMedicalTerms(text: string): Promise<MedicalTerm[]> {
    if (!text || text.trim().length < 10) return [];

    const prompt = `
    You are a medical communication assistant.
    Analyze the following transcript segment for complex medical terms that a layperson might not understand (Grade 6 level).
    If found, provide a simple, short definition.
    
    Transcript:
    "${text}"
    
    Return ONLY a JSON array of objects.
  `;

    // Retry with exponential backoff for 503 errors
    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            const response = result.response;
            const json = response.text();
            return JSON.parse(json) as MedicalTerm[];
        } catch (error: any) {
            const is503 = error?.message?.includes('503') || error?.message?.includes('overloaded');
            if (is503 && attempt < maxRetries - 1) {
                // Wait before retry: 1s, 2s, 4s
                await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
                console.log(`Gemini 3 API overloaded, retrying (${attempt + 1}/${maxRetries})...`);
                continue;
            }
            console.error("Gemini 3 Jargon Detection Error:", error);
            return [];
        }
    }
    return [];
}
