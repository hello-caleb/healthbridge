export type Speaker = 'doctor' | 'patient' | 'unknown';

export type InputType = 'audio' | 'asl';

export interface SpeakerSegment {
    speaker: Speaker;
    text: string;
    timestamp?: string;
    inputType?: InputType; // How the input was received (audio transcription or ASL recognition)
}
