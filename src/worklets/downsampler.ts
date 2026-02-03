// Basic type augmentation for AudioWorkletProcessor since it's not always in default libs
interface AudioWorkletProcessor {
    readonly port: MessagePort;
    process(
        inputs: Float32Array[][],
        outputs: Float32Array[][],
        parameters: Record<string, Float32Array>
    ): boolean;
}

declare var AudioWorkletProcessor: {
    prototype: AudioWorkletProcessor;
    new(options?: any): AudioWorkletProcessor;
};

declare function registerProcessor(
    name: string,
    processorCtor: (new (options?: any) => AudioWorkletProcessor)
): void;

class PCMProcessor extends AudioWorkletProcessor {
    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean {
        const input = inputs[0];
        if (!input || input.length === 0) return true;

        const channelData = input[0]; // Mono
        if (!channelData) return true;

        // Post data to main thread as Int16 (PCM)
        const pcm16 = new Int16Array(channelData.length);
        for (let i = 0; i < channelData.length; i++) {
            const s = Math.max(-1, Math.min(1, channelData[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        this.port.postMessage(pcm16);
        return true;
    }
}

registerProcessor('pcm-processor', PCMProcessor);
