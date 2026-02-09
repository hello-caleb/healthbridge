'use client';

import React, { useEffect, useMemo } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useGraph } from '@react-three/fiber';
import { SkeletonUtils } from 'three-stdlib';
import { useAvatarAnimation } from '../../lib/avatar/useAvatarAnimation';

interface AvatarModelProps {
    url?: string;
    onLoaded?: () => void;
}

// Default to a secure, public Ready Player Me avatar URL if none provided
// This is a generic female avatar for medical context
const DEFAULT_AVATAR_URL = 'https://models.readyplayer.me/64b73e3d6460d9952a8b9f71.glb';

export default function AvatarModel({ url = DEFAULT_AVATAR_URL, onLoaded }: AvatarModelProps) {
    // Preload the model
    useGLTF.preload(url);

    const { scene, animations } = useGLTF(url);

    // Clone the scene to allow multiple instances or independent manipulation
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes, materials } = useGraph(clone);

    // Setup animations
    const { actions, names } = useAnimations(animations, clone);

    // Drive the animation
    useAvatarAnimation(nodes);

    useEffect(() => {
        if (onLoaded) {
            onLoaded();
        }
    }, [onLoaded, names]);

    return (
        <group dispose={null}>
            <primitive object={clone} />
        </group>
    );
}
