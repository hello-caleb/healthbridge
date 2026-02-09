export type GeminiPart =
    | { text: string }
    | { inlineData: { mimeType: string; data: string } };

export type GeminiContent = {
    role: "user" | "model";
    parts: GeminiPart[];
};

export type GeminiTool = {
    functionDeclarations: {
        name: string;
        description: string;
        parameters?: any;
    }[];
};

export type GeminiServerEvent =
    | { serverContent: { modelTurn?: { parts: GeminiPart[] }; inputTranscription?: { text: string }; outputTranscription?: { text: string }; turnComplete?: boolean } }
    | { toolCall: { functionCalls: { name: string; args: any }[] } }
    | { toolResponse: { functionResponses: { name: string; response: any }[] } };

export type GeminiClientEvent =
    | {
        setup: {
            model: string;
            generationConfig?: {
                responseModalities?: ("AUDIO" | "TEXT")[];
                speechConfig?: {
                    voiceConfig?: {
                        prebuiltVoiceConfig?: {
                            voiceName: string;
                        };
                    };
                };
            };
            systemInstruction?: {
                parts: GeminiPart[];
            };
            tools?: GeminiTool[];
            // Enable real-time transcription of audio
            inputAudioTranscription?: Record<string, unknown>;
            outputAudioTranscription?: Record<string, unknown>;
        };
    }
    | {
        clientContent: {
            turns: {
                role: "user";
                parts: GeminiPart[];
            }[];
            turnComplete: boolean;
        };
    }
    | {
        realtimeInput: {
            // New format from Gemini Live API
            audio?: {
                data: string; // Base64
                mimeType: string;
            };
            // Legacy format (deprecated)
            mediaChunks?: {
                mimeType: string;
                data: string; // Base64
            }[];
        };
    }
    | {
        toolResponse: {
            functionResponses: {
                name: string;
                response: any;
            }[];
        }
    };
