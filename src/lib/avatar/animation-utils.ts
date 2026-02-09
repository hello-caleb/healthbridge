import { Euler, Quaternion } from 'three';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export type BoneName =
    | 'Thumb1' | 'Thumb2' | 'Thumb3'
    | 'Index1' | 'Index2' | 'Index3'
    | 'Middle1' | 'Middle2' | 'Middle3'
    | 'Ring1' | 'Ring2' | 'Ring3'
    | 'Pinky1' | 'Pinky2' | 'Pinky3';

export type BoneRotations = Record<BoneName, Euler>;

export interface HandShape {
    name: string;
    bones: BoneRotations;
}

// ------------------------------------------------------------------
// Constants (Ready Player Me / Mixamo Standard Rig)
// ------------------------------------------------------------------

// Base rotation usually needed to correct for T-pose vs rest pose
// These values often need tweaking based on the specific rig
export const REST_POSE: BoneRotations = {
    Thumb1: new Euler(0, 0, 0), Thumb2: new Euler(0, 0, 0), Thumb3: new Euler(0, 0, 0),
    Index1: new Euler(0, 0, 0), Index2: new Euler(0, 0, 0), Index3: new Euler(0, 0, 0),
    Middle1: new Euler(0, 0, 0), Middle2: new Euler(0, 0, 0), Middle3: new Euler(0, 0, 0),
    Ring1: new Euler(0, 0, 0), Ring2: new Euler(0, 0, 0), Ring3: new Euler(0, 0, 0),
    Pinky1: new Euler(0, 0, 0), Pinky2: new Euler(0, 0, 0), Pinky3: new Euler(0, 0, 0),
};

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

/**
 * Linearly interpolates between two Euler angles.
 * Note: For production, using Quaternions and slerp via THREE.js is smoother,
 * but for simple finger curls, Euler lerp is often sufficient and lighter.
 */
export function lerpEuler(start: Euler, end: Euler, alpha: number): Euler {
    return new Euler(
        start.x + (end.x - start.x) * alpha,
        start.y + (end.y - start.y) * alpha,
        start.z + (end.z - start.z) * alpha,
        start.order
    );
}

/**
 * Helper to easily define a finger curl.
 * @param curl Amount to curl (0 = straight, 1 = fully bent)
 * @param spread Amount to spread side-to-side (-1 to 1)
 */
export function getFingerRotation(curl: number, spread: number = 0): Euler {
    // These multipliers are approximate for a standard rig
    // X-axis usually controls curl, Z or Y axis controls spread
    return new Euler(
        curl * 1.5, // 1.5 radians is approx 90 degrees
        spread * 0.2, // Slight spread
        0
    );
}
