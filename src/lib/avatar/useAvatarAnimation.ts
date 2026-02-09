import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Euler, Object3D, Vector3, Quaternion } from 'three';
import { useAvatarStore } from '../../stores/avatar-store';
import { FINGERSPELLING_DICTIONARY } from './fingerspelling';
import { BoneName, BoneRotations, REST_POSE } from './animation-utils';

// Mapping from our abstract bone names to Ready Player Me / Mixamo bone names (Right Hand)
const BONE_MAP: Record<BoneName, string> = {
    Thumb1: 'RightHandThumb1',
    Thumb2: 'RightHandThumb2',
    Thumb3: 'RightHandThumb3',
    Index1: 'RightHandIndex1',
    Index2: 'RightHandIndex2',
    Index3: 'RightHandIndex3',
    Middle1: 'RightHandMiddle1',
    Middle2: 'RightHandMiddle2',
    Middle3: 'RightHandMiddle3',
    Ring1: 'RightHandRing1',
    Ring2: 'RightHandRing2',
    Ring3: 'RightHandRing3',
    Pinky1: 'RightHandPinky1',
    Pinky2: 'RightHandPinky2',
    Pinky3: 'RightHandPinky3',
};

// Animation settings
const LETTER_DURATION = 0.4; // Seconds per letter
const TRANSITION_SPEED = 10; // Lerp speed

export function useAvatarAnimation(nodes: Record<string, Object3D>) {
    const { currentState, currentWord, playNext } = useAvatarStore();

    // Animation state refs
    const letterIndexRef = useRef(0);
    const letterTimerRef = useRef(0);
    const currentRotationsRef = useRef<BoneRotations>({ ...REST_POSE });

    useEffect(() => {
        // Reset when word changes
        if (currentWord) {
            letterIndexRef.current = 0;
            letterTimerRef.current = 0;
        }
    }, [currentWord]);

    useFrame((state, delta) => {
        if (currentState !== 'SIGNING' || !currentWord) {
            // Apply Rest Pose when idle
            applyRotations(nodes, REST_POSE, delta * 2);
            return;
        }

        const word = currentWord.toUpperCase();
        const currentLetter = word[letterIndexRef.current] || ' ';
        const targetRotations = FINGERSPELLING_DICTIONARY[currentLetter] || REST_POSE;

        // Apply rotation to bones
        applyRotations(nodes, targetRotations, delta * TRANSITION_SPEED);

        // Advance timer
        letterTimerRef.current += delta;

        // Check if time to move to next letter
        if (letterTimerRef.current >= LETTER_DURATION) {
            letterTimerRef.current = 0;
            letterIndexRef.current++;

            // Check if word is finished
            if (letterIndexRef.current >= word.length) {
                // Determine if we need a pause or go straight to next
                // For now, just trigger next
                playNext();
            }
        }
    });
}

function applyRotations(nodes: Record<string, Object3D>, target: BoneRotations, alpha: number) {
    Object.entries(target).forEach(([boneName, targetEuler]) => {
        const nodeName = BONE_MAP[boneName as BoneName];
        const node = nodes[nodeName];

        if (node) {
            // Smoothly interpolate current rotation to target
            // Using slerp for quaternions would be better, but simple lerp on Euler is okay for small movements
            // Actually, let's use Quaternion slerp for correctness

            const targetQuat = new Quaternion().setFromEuler(targetEuler);
            node.quaternion.slerp(targetQuat, Math.min(alpha, 1));
        }
    });
}
