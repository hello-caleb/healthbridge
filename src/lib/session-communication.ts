/**
 * Session Communication Service
 * 
 * Bidirectional messaging between doctor and patient views
 * using LiveKit data channels for real-time communication.
 */

import { SignState } from '@/hooks/use-hand-landmarker';
import { ConfidenceResult } from './confidence-scorer';
import { ASLTranslationResult } from './asl-translation-service';

// ============================================================================
// Message Types
// ============================================================================

export type SessionMessageType =
    | 'repeat_request'
    | 'translation'
    | 'signing_status'
    | 'understood'
    | 'connection_status';

export interface RepeatRequest {
    reason: 'low_confidence' | 'unclear' | 'manual';
    messageId?: string;
}

export interface TranslationPayload {
    text: string;
    confidence: ConfidenceResult;
    timestamp: string;
    translationId: string;
}

export interface SigningStatusPayload {
    isSigning: boolean;
    signState: SignState;
    velocity?: number;
}

export interface ConnectionStatusPayload {
    isConnected: boolean;
    role: 'doctor' | 'patient';
}

export interface SessionMessage<T = unknown> {
    type: SessionMessageType;
    payload: T;
    timestamp: string;
    senderId: string;
}

// ============================================================================
// Message Builders
// ============================================================================

let sessionId = '';

/**
 * Initialize session with a unique ID
 */
export function initializeSession(id?: string): string {
    sessionId = id || `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return sessionId;
}

/**
 * Get current session ID
 */
export function getSessionId(): string {
    return sessionId;
}

/**
 * Create a repeat request message (doctor → patient)
 */
export function createRepeatRequest(
    reason: RepeatRequest['reason'],
    messageId?: string
): SessionMessage<RepeatRequest> {
    return {
        type: 'repeat_request',
        payload: { reason, messageId },
        timestamp: new Date().toISOString(),
        senderId: sessionId,
    };
}

/**
 * Create a translation message (patient → doctor)
 */
export function createTranslationMessage(
    translation: ASLTranslationResult,
    confidence: ConfidenceResult
): SessionMessage<TranslationPayload> {
    return {
        type: 'translation',
        payload: {
            text: translation.translation,
            confidence,
            timestamp: translation.timestamp,
            translationId: `trans-${Date.now()}`,
        },
        timestamp: new Date().toISOString(),
        senderId: sessionId,
    };
}

/**
 * Create a signing status message (patient → doctor)
 */
export function createSigningStatusMessage(
    isSigning: boolean,
    signState: SignState,
    velocity?: number
): SessionMessage<SigningStatusPayload> {
    return {
        type: 'signing_status',
        payload: { isSigning, signState, velocity },
        timestamp: new Date().toISOString(),
        senderId: sessionId,
    };
}

/**
 * Create an "understood" acknowledgment message (doctor → patient)
 */
export function createUnderstoodMessage(
    translationId?: string
): SessionMessage<{ translationId?: string }> {
    return {
        type: 'understood',
        payload: { translationId },
        timestamp: new Date().toISOString(),
        senderId: sessionId,
    };
}

/**
 * Create a connection status message
 */
export function createConnectionStatusMessage(
    isConnected: boolean,
    role: 'doctor' | 'patient'
): SessionMessage<ConnectionStatusPayload> {
    return {
        type: 'connection_status',
        payload: { isConnected, role },
        timestamp: new Date().toISOString(),
        senderId: sessionId,
    };
}

// ============================================================================
// Message Serialization
// ============================================================================

/**
 * Serialize message for data channel transmission
 */
export function serializeMessage(message: SessionMessage): string {
    return JSON.stringify(message);
}

/**
 * Deserialize message from data channel
 */
export function deserializeMessage(data: string): SessionMessage | null {
    try {
        const parsed = JSON.parse(data);
        if (parsed.type && parsed.timestamp && parsed.senderId) {
            return parsed as SessionMessage;
        }
        console.warn('Invalid session message format:', parsed);
        return null;
    } catch (error) {
        console.error('Failed to deserialize session message:', error);
        return null;
    }
}

// ============================================================================
// Conversation History
// ============================================================================

export interface ConversationEntry {
    id: string;
    type: 'patient_asl' | 'patient_audio' | 'doctor_request';
    text: string;
    confidence?: ConfidenceResult;
    timestamp: string;
}

const conversationHistory: ConversationEntry[] = [];

/**
 * Add entry to conversation history
 */
export function addToHistory(entry: Omit<ConversationEntry, 'id'>): ConversationEntry {
    const newEntry: ConversationEntry = {
        ...entry,
        id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    conversationHistory.unshift(newEntry);

    // Keep last 100 entries
    if (conversationHistory.length > 100) {
        conversationHistory.pop();
    }

    return newEntry;
}

/**
 * Get conversation history
 */
export function getConversationHistory(): ConversationEntry[] {
    return [...conversationHistory];
}

/**
 * Clear conversation history
 */
export function clearHistory(): void {
    conversationHistory.length = 0;
}
