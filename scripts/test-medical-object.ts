
import { analyzeMedicalObject } from '../src/lib/gemini-3-service';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Mock the GoogleGenerativeAI client if running in a script context where build alias isn't available? 
// No, we should run this with ts-node and proper paths or just use the SDK directly in the script for simplicity.

const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

async function testMedicalObject(imagePath: string) {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        console.error("Error: NEXT_PUBLIC_GEMINI_API_KEY is not set in environment");
        return;
    }

    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

    try {
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');

        console.log(`Analyzing image: ${imagePath}...`);

        // Re-implementing logic here since importing from src/lib might fail due to aliases in ts-node without config
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
                data: base64Image,
                mimeType: "image/jpeg",
            },
        };

        const result = await visionModel.generateContent([prompt, imagePart]);
        const response = result.response;
        console.log("\n--- Analysis Result ---");
        console.log(response.text());

    } catch (error) {
        console.error("Test failed:", error);
    }
}

// Check if image path provided
const imagePath = process.argv[2];
if (!imagePath) {
    console.log("Usage: npx ts-node scripts/test-medical-object.ts <path-to-image>");
} else {
    testMedicalObject(imagePath);
}
