/**
 * Notification Sounds Service
 * 
 * Audio notifications for doctor dashboard using Web Audio API.
 * Provides subtle, professional sounds for message arrivals.
 */

// ============================================================================
// Types & Configuration
// ============================================================================

export interface NotificationSettings {
    enabled: boolean;
    volume: number; // 0-100
    newMessageSound: boolean;
    lowConfidenceSound: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
    enabled: true,
    volume: 50,
    newMessageSound: true,
    lowConfidenceSound: true,
};

const STORAGE_KEY = 'healthbridge-notification-settings';

// ============================================================================
// Audio Context Management
// ============================================================================

let audioContext: AudioContext | null = null;

/**
 * Get or create the audio context (lazy initialization)
 */
function getAudioContext(): AudioContext {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Resume if suspended (browser autoplay policies)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    return audioContext;
}

// ============================================================================
// Sound Generation
// ============================================================================

/**
 * Generate a pleasant chime sound for new messages
 * Uses a sine wave with harmonic overtones and exponential decay
 */
function generateNewMessageSound(ctx: AudioContext, volume: number): void {
    const now = ctx.currentTime;
    const duration = 0.3;
    const normalizedVolume = (volume / 100) * 0.3; // Max gain 0.3 to prevent distortion

    // Create oscillators for a pleasant chord (C major)
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5

    frequencies.forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now);

        // Stagger the entry slightly for a more natural sound
        const startTime = now + (index * 0.02);

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(normalizedVolume, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration + 0.1);
    });
}

/**
 * Generate a distinct sound for low-confidence messages
 * Uses a lower tone with slight vibrato to convey uncertainty
 */
function generateLowConfidenceSound(ctx: AudioContext, volume: number): void {
    const now = ctx.currentTime;
    const duration = 0.4;
    const normalizedVolume = (volume / 100) * 0.25;

    // Create main oscillator (lower frequency for warning feel)
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const lfoOscillator = ctx.createOscillator(); // For vibrato
    const lfoGain = ctx.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(349.23, now); // F4

    // Add subtle vibrato
    lfoOscillator.type = 'sine';
    lfoOscillator.frequency.setValueAtTime(6, now);
    lfoGain.gain.setValueAtTime(5, now);

    lfoOscillator.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);

    // Envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(normalizedVolume, now + 0.05);
    gainNode.gain.setValueAtTime(normalizedVolume, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    lfoOscillator.start(now);
    oscillator.stop(now + duration + 0.1);
    lfoOscillator.stop(now + duration + 0.1);

    // Add a second, slightly delayed tone for "dip" effect
    setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(293.66, ctx.currentTime); // D4 (lower)

        gain2.gain.setValueAtTime(0, ctx.currentTime);
        gain2.gain.linearRampToValueAtTime(normalizedVolume * 0.7, ctx.currentTime + 0.03);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.3);
    }, 150);
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Load notification settings from localStorage
 */
export function loadSettings(): NotificationSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        }
    } catch (error) {
        console.warn('Failed to load notification settings:', error);
    }

    return DEFAULT_SETTINGS;
}

/**
 * Save notification settings to localStorage
 */
export function saveSettings(settings: Partial<NotificationSettings>): NotificationSettings {
    const current = loadSettings();
    const updated = { ...current, ...settings };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
        console.warn('Failed to save notification settings:', error);
    }

    return updated;
}

/**
 * Play new message notification sound
 */
export function playNewMessageSound(): void {
    const settings = loadSettings();

    if (!settings.enabled || !settings.newMessageSound) return;

    try {
        const ctx = getAudioContext();
        generateNewMessageSound(ctx, settings.volume);
    } catch (error) {
        console.warn('Failed to play new message sound:', error);
    }
}

/**
 * Play low confidence notification sound
 */
export function playLowConfidenceSound(): void {
    const settings = loadSettings();

    if (!settings.enabled || !settings.lowConfidenceSound) return;

    try {
        const ctx = getAudioContext();
        generateLowConfidenceSound(ctx, settings.volume);
    } catch (error) {
        console.warn('Failed to play low confidence sound:', error);
    }
}

/**
 * Play appropriate sound based on confidence level
 */
export function playNotificationForConfidence(confidenceLevel: 'high' | 'medium' | 'low' | 'very-low'): void {
    if (confidenceLevel === 'low' || confidenceLevel === 'very-low') {
        playLowConfidenceSound();
    } else {
        playNewMessageSound();
    }
}

/**
 * Test notifications (for settings UI)
 */
export function testSound(type: 'newMessage' | 'lowConfidence'): void {
    try {
        const ctx = getAudioContext();
        const settings = loadSettings();

        if (type === 'newMessage') {
            generateNewMessageSound(ctx, settings.volume);
        } else {
            generateLowConfidenceSound(ctx, settings.volume);
        }
    } catch (error) {
        console.warn('Failed to test sound:', error);
    }
}

/**
 * Cleanup audio context (call on unmount)
 */
export function cleanup(): void {
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
}
