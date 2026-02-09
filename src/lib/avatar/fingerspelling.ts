import { Euler } from 'three';
import { BoneRotations, REST_POSE } from './animation-utils';

// Helper to create a new Euler quickly
const E = (x: number, y: number, z: number) => new Euler(x, y, z);

/**
 * ASL Fingerspelling Dictionary
 * Maps a single character (uppercase) to a set of bone rotations.
 * 
 * Note: These values are approximations for a standard T-pose rig.
 * Real-world rigs might require calibration offsets.
 */
export const FINGERSPELLING_DICTIONARY: Record<string, BoneRotations> = {
    // REST POSE (Space/Idle)
    ' ': REST_POSE,

    // A: Fist with thumb against side of index finger
    'A': {
        ...REST_POSE,
        Thumb1: E(0.5, 0, 0.5), Thumb2: E(0.2, 0, 0), Thumb3: E(0.2, 0, 0),
        Index1: E(1.5, 0, 0), Index2: E(1.5, 0, 0), Index3: E(1.5, 0, 0),
        Middle1: E(1.5, 0, 0), Middle2: E(1.5, 0, 0), Middle3: E(1.5, 0, 0),
        Ring1: E(1.5, 0, 0), Ring2: E(1.5, 0, 0), Ring3: E(1.5, 0, 0),
        Pinky1: E(1.5, 0, 0), Pinky2: E(1.5, 0, 0), Pinky3: E(1.5, 0, 0),
    },

    // B: Flat hand, thumb tucked in
    'B': {
        ...REST_POSE,
        Thumb1: E(1.0, 0.5, 0), Thumb2: E(0.5, 0, 0), Thumb3: E(0.5, 0, 0),
        Index1: E(0, 0, 0), Index2: E(0, 0, 0), Index3: E(0, 0, 0),
        Middle1: E(0, 0, 0), Middle2: E(0, 0, 0), Middle3: E(0, 0, 0),
        Ring1: E(0, 0, 0), Ring2: E(0, 0, 0), Ring3: E(0, 0, 0),
        Pinky1: E(0, 0, 0), Pinky2: E(0, 0, 0), Pinky3: E(0, 0, 0),
    },

    // C: C-shape hand
    'C': {
        ...REST_POSE,
        Thumb1: E(0.5, 0, 0), Thumb2: E(0.2, 0, 0), Thumb3: E(0.2, 0, 0),
        Index1: E(0.5, 0, 0), Index2: E(0.5, 0, 0), Index3: E(0.2, 0, 0),
        Middle1: E(0.5, 0, 0), Middle2: E(0.5, 0, 0), Middle3: E(0.2, 0, 0),
        Ring1: E(0.5, 0, 0), Ring2: E(0.5, 0, 0), Ring3: E(0.2, 0, 0),
        Pinky1: E(0.5, 0, 0), Pinky2: E(0.5, 0, 0), Pinky3: E(0.2, 0, 0),
    },

    // D: Index up, others touching thumb (loop)
    'D': {
        ...REST_POSE,
        Thumb1: E(0.8, 0, 0.5), Thumb2: E(0.2, 0, 0), Thumb3: E(0.2, 0, 0),
        Index1: E(0, 0, 0), Index2: E(0, 0, 0), Index3: E(0, 0, 0),
        Middle1: E(1.5, 0, 0), Middle2: E(1.0, 0, 0), Middle3: E(0.5, 0, 0),
        Ring1: E(1.5, 0, 0), Ring2: E(1.0, 0, 0), Ring3: E(0.5, 0, 0),
        Pinky1: E(1.5, 0, 0), Pinky2: E(1.0, 0, 0), Pinky3: E(0.5, 0, 0),
    },

    // E: All fingers curled, thumb tucked under
    'E': {
        ...REST_POSE,
        Thumb1: E(1.2, 0, 0.8), Thumb2: E(0.5, 0, 0), Thumb3: E(0.5, 0, 0),
        Index1: E(1.5, 0, 0), Index2: E(1.5, 0, 0), Index3: E(1.0, 0, 0),
        Middle1: E(1.5, 0, 0), Middle2: E(1.5, 0, 0), Middle3: E(1.0, 0, 0),
        Ring1: E(1.5, 0, 0), Ring2: E(1.5, 0, 0), Ring3: E(1.0, 0, 0),
        Pinky1: E(1.5, 0, 0), Pinky2: E(1.5, 0, 0), Pinky3: E(1.0, 0, 0),
    },

    // F: "OK" sign (thumb and index touch, others straight)
    'F': {
        ...REST_POSE,
        Thumb1: E(0.5, 0.2, 0.2), Thumb2: E(0.5, 0, 0), Thumb3: E(0.2, 0, 0),
        Index1: E(1.0, 0, 0), Index2: E(0.5, 0, 0), Index3: E(0.2, 0, 0),
        Middle1: E(0, 0, 0.1), Middle2: E(0, 0, 0), Middle3: E(0, 0, 0),
        Ring1: E(0, 0, 0.15), Ring2: E(0, 0, 0), Ring3: E(0, 0, 0),
        Pinky1: E(0, 0, 0.2), Pinky2: E(0, 0, 0), Pinky3: E(0, 0, 0),
    },

    // G: Index pointing left, thumb parallel above it
    'G': {
        ...REST_POSE,
        // Let's model it as a fist with index pointing out, thumb parallel
        Thumb1: E(0, 0.5, 0), Thumb2: E(0, 0, 0), Thumb3: E(0, 0, 0),
        Index1: E(0, 0, 0), Index2: E(0, 0, 0), Index3: E(0, 0, 0),
        Middle1: E(1.5, 0, 0), Middle2: E(1.5, 0, 0), Middle3: E(1.0, 0, 0),
        Ring1: E(1.5, 0, 0), Ring2: E(1.5, 0, 0), Ring3: E(1.0, 0, 0),
        Pinky1: E(1.5, 0, 0), Pinky2: E(1.5, 0, 0), Pinky3: E(1.0, 0, 0),
    },

    // H: Index and Middle pointing left (together)
    'H': {
        ...REST_POSE,
        Thumb1: E(0.5, 0, 0), Thumb2: E(0, 0, 0), Thumb3: E(0, 0, 0),
        Index1: E(0, 0, 0), Index2: E(0, 0, 0), Index3: E(0, 0, 0),
        Middle1: E(0, 0, 0), Middle2: E(0, 0, 0), Middle3: E(0, 0, 0),
        Ring1: E(1.5, 0, 0), Ring2: E(1.5, 0, 0), Ring3: E(1.0, 0, 0),
        Pinky1: E(1.5, 0, 0), Pinky2: E(1.5, 0, 0), Pinky3: E(1.0, 0, 0),
    },

    // I: Pinky up
    'I': {
        ...REST_POSE,
        Thumb1: E(0.5, 0, 0.5), Thumb2: E(0.2, 0, 0), Thumb3: E(0.2, 0, 0),
        Index1: E(1.5, 0, 0), Index2: E(1.5, 0, 0), Index3: E(1.0, 0, 0),
        Middle1: E(1.5, 0, 0), Middle2: E(1.5, 0, 0), Middle3: E(1.0, 0, 0),
        Ring1: E(1.5, 0, 0), Ring2: E(1.5, 0, 0), Ring3: E(1.0, 0, 0),
        Pinky1: E(0, 0, 0), Pinky2: E(0, 0, 0), Pinky3: E(0, 0, 0),
    },

    // J: Pinky traces 'J' (Motion not captured in static pose, just I shape for start)
    'J': {
        ...REST_POSE,
        // Same as I for static start
        Thumb1: E(0.5, 0, 0.5), Thumb2: E(0.2, 0, 0), Thumb3: E(0.2, 0, 0),
        Index1: E(1.5, 0, 0), Index2: E(1.5, 0, 0), Index3: E(1.0, 0, 0),
        Middle1: E(1.5, 0, 0), Middle2: E(1.5, 0, 0), Middle3: E(1.0, 0, 0),
        Ring1: E(1.5, 0, 0), Ring2: E(1.5, 0, 0), Ring3: E(1.0, 0, 0),
        Pinky1: E(0, 0, 0), Pinky2: E(0, 0, 0), Pinky3: E(0, 0, 0),
    },

    // K: "V" with thumb on middle finger joint
    'K': {
        ...REST_POSE,
        Thumb1: E(0.5, 0, 0), Thumb2: E(0.5, 0, 0), Thumb3: E(0.5, 0, 0),
        Index1: E(0, 0, 0), Index2: E(0, 0, 0), Index3: E(0, 0, 0), // Up
        Middle1: E(0.2, 0, 0), Middle2: E(0, 0, 0), Middle3: E(0, 0, 0), // Forward slightly
        Ring1: E(1.5, 0, 0), Ring2: E(1.5, 0, 0), Ring3: E(1.0, 0, 0),
        Pinky1: E(1.5, 0, 0), Pinky2: E(1.5, 0, 0), Pinky3: E(1.0, 0, 0),
    },

    // L: L-shape
    'L': {
        ...REST_POSE,
        Thumb1: E(0, -0.5, 0), Thumb2: E(0, 0, 0), Thumb3: E(0, 0, 0), // Out
        Index1: E(0, 0, 0), Index2: E(0, 0, 0), Index3: E(0, 0, 0), // Up
        Middle1: E(1.5, 0, 0), Middle2: E(1.5, 0, 0), Middle3: E(1.0, 0, 0),
        Ring1: E(1.5, 0, 0), Ring2: E(1.5, 0, 0), Ring3: E(1.0, 0, 0),
        Pinky1: E(1.5, 0, 0), Pinky2: E(1.5, 0, 0), Pinky3: E(1.0, 0, 0),
    },

    // M: Three fingers over thumb
    'M': {
        ...REST_POSE,
        Thumb1: E(1.2, 0, 0.5), Thumb2: E(0.5, 0, 0), Thumb3: E(0.5, 0, 0), // Tucked
        Index1: E(1.2, 0.1, 0), Index2: E(1.0, 0, 0), Index3: E(0.5, 0, 0), // Over thumb
        Middle1: E(1.2, 0, 0), Middle2: E(1.0, 0, 0), Middle3: E(0.5, 0, 0),
        Ring1: E(1.2, -0.1, 0), Ring2: E(1.0, 0, 0), Ring3: E(0.5, 0, 0),
        Pinky1: E(1.5, 0, 0), Pinky2: E(1.5, 0, 0), Pinky3: E(1.0, 0, 0), // Tucked in
    },

    // N: Two fingers over thumb
    'N': {
        ...REST_POSE,
        Thumb1: E(1.2, 0, 0.5), Thumb2: E(0.5, 0, 0), Thumb3: E(0.5, 0, 0),
        Index1: E(1.2, 0.1, 0), Index2: E(1.0, 0, 0), Index3: E(0.5, 0, 0),
        Middle1: E(1.2, -0.1, 0), Middle2: E(1.0, 0, 0), Middle3: E(0.5, 0, 0),
        Ring1: E(1.5, 0, 0), Ring2: E(1.5, 0, 0), Ring3: E(1.0, 0, 0), // Tucked
        Pinky1: E(1.5, 0, 0), Pinky2: E(1.5, 0, 0), Pinky3: E(1.0, 0, 0),
    },

    // O: O-shape
    'O': {
        ...REST_POSE,
        Thumb1: E(0.5, 0.2, 0), Thumb2: E(0.2, 0, 0), Thumb3: E(0.2, 0, 0),
        Index1: E(1.0, 0, 0), Index2: E(0.8, 0, 0), Index3: E(0.5, 0, 0),
        Middle1: E(1.0, 0, 0), Middle2: E(0.8, 0, 0), Middle3: E(0.5, 0, 0),
        Ring1: E(1.0, 0, 0), Ring2: E(0.8, 0, 0), Ring3: E(0.5, 0, 0),
        Pinky1: E(1.0, 0, 0), Pinky2: E(0.8, 0, 0), Pinky3: E(0.5, 0, 0),
    },

    // P: K pointing down (requires wrist rotation, modeled as K for now)
    'P': {
        ...REST_POSE, // Same as K
        Thumb1: E(0.5, 0, 0), Thumb2: E(0.5, 0, 0), Thumb3: E(0.5, 0, 0),
        Index1: E(0, 0, 0), Index2: E(0, 0, 0), Index3: E(0, 0, 0),
        Middle1: E(0.2, 0, 0), Middle2: E(0, 0, 0), Middle3: E(0, 0, 0),
        Ring1: E(1.5, 0, 0), Ring2: E(1.5, 0, 0), Ring3: E(1.0, 0, 0),
        Pinky1: E(1.5, 0, 0), Pinky2: E(1.5, 0, 0), Pinky3: E(1.0, 0, 0),
    },

    // Q: G pointing down
    'Q': {
        ...REST_POSE, // Same as G
        Thumb1: E(0, 0.5, 0), Thumb2: E(0, 0, 0), Thumb3: E(0, 0, 0),
        Index1: E(0, 0, 0), Index2: E(0, 0, 0), Index3: E(0, 0, 0),
        Middle1: E(1.5, 0, 0), Middle2: E(1.5, 0, 0), Middle3: E(1.0, 0, 0),
        Ring1: E(1.5, 0, 0), Ring2: E(1.5, 0, 0), Ring3: E(1.0, 0, 0),
        Pinky1: E(1.5, 0, 0), Pinky2: E(1.5, 0, 0), Pinky3: E(1.0, 0, 0),
    },

    // R: Crossed fingers
    'R': {
        ...REST_POSE,
        Thumb1: E(0.5, 0, 0.5), Thumb2: E(0, 0, 0), Thumb3: E(0, 0, 0),
        Index1: E(0, 0, 0), Index2: E(0, 0, 0), Index3: E(0, 0, 0),
        Middle1: E(0, 0, 0), Middle2: E(0, 0, 0), Middle3: E(0, 0, 0), // Needs cross logic, difficult with just Euler. Just straight up for now.
        Ring1: E(1.5, 0, 0), Ring2: E(1.5, 0, 0), Ring3: E(1.0, 0, 0),
        Pinky1: E(1.5, 0, 0), Pinky2: E(1.5, 0, 0), Pinky3: E(1.0, 0, 0),
    },

    // S: Fist (thumb over index)
    'S': {
        ...REST_POSE,
        Thumb1: E(1.0, 0, 0), Thumb2: E(0.5, 0, 0), Thumb3: E(0.5, 0, 0), // Over
        Index1: E(1.5, 0, 0), Index2: E(1.5, 0, 0), Index3: E(1.0, 0, 0),
        Middle1: E(1.5, 0, 0), Middle2: E(1.5, 0, 0), Middle3: E(1.0, 0, 0),
        Ring1: E(1.5, 0, 0), Ring2: E(1.5, 0, 0), Ring3: E(1.0, 0, 0),
        Pinky1: E(1.5, 0, 0), Pinky2: E(1.5, 0, 0), Pinky3: E(1.0, 0, 0),
    },

    // T: Thumb under index
    'T': {
        ...REST_POSE,
        Thumb1: E(1.0, 0, 0.5), Thumb2: E(0.5, 0, 0), Thumb3: E(0.5, 0, 0), // Under index
        Index1: E(1.2, 0, 0), Index2: E(1.0, 0, 0), Index3: E(0.5, 0, 0), // Curled over
        Middle1: E(1.5, 0, 0), Middle2: E(1.5, 0, 0), Middle3: E(1.0, 0, 0),
        Ring1: E(1.5, 0, 0), Ring2: E(1.5, 0, 0), Ring3: E(1.0, 0, 0),
        Pinky1: E(1.5, 0, 0), Pinky2: E(1.5, 0, 0), Pinky3: E(1.0, 0, 0),
    },

    // U: Index/Middle up together
    'U': {
        ...REST_POSE,
        Thumb1: E(0.5, 0, 0.5), Thumb2: E(0, 0, 0), Thumb3: E(0, 0, 0),
        Index1: E(0, 0, 0), Index2: E(0, 0, 0), Index3: E(0, 0, 0),
        Middle1: E(0, 0, 0), Middle2: E(0, 0, 0), Middle3: E(0, 0, 0),
        Ring1: E(1.5, 0, 0), Ring2: E(1.5, 0, 0), Ring3: E(1.0, 0, 0),
        Pinky1: E(1.5, 0, 0), Pinky2: E(1.5, 0, 0), Pinky3: E(1.0, 0, 0),
    },

    // V: Index/Middle up separated
    'V': {
        ...REST_POSE,
        Thumb1: E(0.5, 0, 0.5), Thumb2: E(0, 0, 0), Thumb3: E(0, 0, 0),
        Index1: E(0, 0.1, 0), Index2: E(0, 0, 0), Index3: E(0, 0, 0), // Spread
        Middle1: E(0, -0.1, 0), Middle2: E(0, 0, 0), Middle3: E(0, 0, 0), // Spread
        Ring1: E(1.5, 0, 0), Ring2: E(1.5, 0, 0), Ring3: E(1.0, 0, 0),
        Pinky1: E(1.5, 0, 0), Pinky2: E(1.5, 0, 0), Pinky3: E(1.0, 0, 0),
    },

    // W: 3 fingers up
    'W': {
        ...REST_POSE,
        Thumb1: E(0.5, 0, 0.5), Thumb2: E(0, 0, 0), Thumb3: E(0, 0, 0),
        Index1: E(0, 0.15, 0), Index2: E(0, 0, 0), Index3: E(0, 0, 0),
        Middle1: E(0, 0, 0), Middle2: E(0, 0, 0), Middle3: E(0, 0, 0),
        Ring1: E(0, -0.15, 0), Ring2: E(0, 0, 0), Ring3: E(0, 0, 0),
        Pinky1: E(1.5, 0, 0), Pinky2: E(1.5, 0, 0), Pinky3: E(1.0, 0, 0),
    },

    // X: Hooked index
    'X': {
        ...REST_POSE,
        Thumb1: E(0.5, 0, 0.5), Thumb2: E(0, 0, 0), Thumb3: E(0, 0, 0),
        Index1: E(0.5, 0, 0), Index2: E(1.5, 0, 0), Index3: E(1.0, 0, 0), // Hook
        Middle1: E(1.5, 0, 0), Middle2: E(1.5, 0, 0), Middle3: E(1.0, 0, 0),
        Ring1: E(1.5, 0, 0), Ring2: E(1.5, 0, 0), Ring3: E(1.0, 0, 0),
        Pinky1: E(1.5, 0, 0), Pinky2: E(1.5, 0, 0), Pinky3: E(1.0, 0, 0),
    },

    // Y: Thumb and Pinky out
    'Y': {
        ...REST_POSE,
        Thumb1: E(0, -0.5, 0), Thumb2: E(0, 0, 0), Thumb3: E(0, 0, 0), // Out
        Index1: E(1.5, 0, 0), Index2: E(1.5, 0, 0), Index3: E(1.0, 0, 0),
        Middle1: E(1.5, 0, 0), Middle2: E(1.5, 0, 0), Middle3: E(1.0, 0, 0),
        Ring1: E(1.5, 0, 0), Ring2: E(1.5, 0, 0), Ring3: E(1.0, 0, 0),
        Pinky1: E(0, 0, 0), Pinky2: E(0, 0, 0), Pinky3: E(0, 0, 0), // Out
    },

    // Z: Index traces Z (Motion not captured, using index point start)
    'Z': {
        ...REST_POSE,
        Thumb1: E(0.5, 0, 0.5), Thumb2: E(0, 0, 0), Thumb3: E(0, 0, 0),
        Index1: E(0, 0, 0), Index2: E(0, 0, 0), Index3: E(0, 0, 0),
        Middle1: E(1.5, 0, 0), Middle2: E(1.5, 0, 0), Middle3: E(1.0, 0, 0),
        Ring1: E(1.5, 0, 0), Ring2: E(1.5, 0, 0), Ring3: E(1.0, 0, 0),
        Pinky1: E(1.5, 0, 0), Pinky2: E(1.5, 0, 0), Pinky3: E(1.0, 0, 0),
    }
};
