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
    | { serverContent: { modelTurn: { parts: GeminiPart[] }; turnComplete?: boolean } }
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
            mediaChunks: {
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
