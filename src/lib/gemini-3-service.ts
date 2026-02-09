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

export type MedicalObjectAnalysis = {
    name: string;
    purpose: string;
    warnings: string[];
    confidence: 'high' | 'medium' | 'low';
};

export async function analyzeMedicalObject(base64Image: string): Promise<MedicalObjectAnalysis | null> {
    if (!base64Image) return null;

    try {
        // Use Gemini 3 Flash Preview for fast multimodal object recognition
        const visionModel = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        name: { type: SchemaType.STRING },
                        purpose: { type: SchemaType.STRING },
                        warnings: {
                            type: SchemaType.ARRAY,
                            items: { type: SchemaType.STRING }
                        },
                        confidence: { type: SchemaType.STRING, format: "enum", enum: ["high", "medium", "low"] }
                    },
                    required: ["name", "purpose", "warnings", "confidence"]
                }
            }
        });

        const prompt = `
        You are a medical triage assistant. Analyze this image of a medical object (pill bottle, device, wound, symptom).
        Identify the object or condition.
        Provide its common purpose or medical significance.
        List any criticial warnings or safety checks.
        
        Keep definitions simple (Grade 6 level).
        `;

        const imagePart = {
            inlineData: {
                data: base64Image.replace(/^data:image\/\w+;base64,/, ""),
                mimeType: "image/jpeg",
            },
        };

        const result = await visionModel.generateContent([prompt, imagePart]);
        const response = result.response;
        return JSON.parse(response.text()) as MedicalObjectAnalysis;

    } catch (error) {
        console.error("Medical Object Triage Error:", error);
        return null;
    }
}

export async function queryPatientHistory(question: string, historyContext: string): Promise<string | null> {
    if (!question || !historyContext) return null;

    try {
        // Use Gemini 3 Pro Preview for advanced reasoning on patient history
        const model = genAI.getGenerativeModel({
            model: "gemini-3-pro-preview",
        });

        const prompt = `
        You are a helpful medical assistant. You have access to the patient's history below.
        Answer the doctor's question based ONLY on the provided history.
        If the information is not in the history, say "I don't see that in the records."
        Keep answers concise and professional.
        
        --- PATIENT HISTORY START ---
        ${historyContext}
        --- PATIENT HISTORY END ---

        Question: ${question}
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();

    } catch (error) {
        console.error("Patient History Query Error:", error);
        return "Sorry, I couldn't access the history at this moment.";
    }
}

