export type GeminiPart =
    | { text: string }
    | { inlineData: { mimeType: string; data: string } };

export type GeminiContent = {
    role: "user" | "model";
    parts: GeminiPart[];
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
    };
