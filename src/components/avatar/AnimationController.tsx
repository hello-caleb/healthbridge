'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAvatarStore } from '@/stores/avatar-store';

export default function AnimationController() {
    const { currentState, currentWord, playNext, setAnimationState } = useAvatarStore();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // This component doesn't render anything visual, it just controls logic
    // It can be placed inside the <Canvas> to access R3F hooks like useFrame

    useEffect(() => {
        if (currentState === 'SIGNING' && currentWord) {
            console.log(`[Avatar] Signing: "${currentWord}"`);

            // Simulate animation duration
            // In the real implementation, this would be driven by the animation clip length
            // or the procedural fingerspelling duration
            const duration = Math.max(1000, currentWord.length * 200); // 200ms per letter or 1s min

            timeoutRef.current = setTimeout(() => {
                console.log(`[Avatar] Finished: "${currentWord}"`);
                playNext(); // Move to next word
            }, duration);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [currentState, currentWord, playNext]);

    return null;
}
