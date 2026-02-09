'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import AvatarModel from './AvatarModel';
import AnimationController from './AnimationController';

interface AvatarCanvasProps {
    className?: string;
}

export default function AvatarCanvas({ className }: AvatarCanvasProps) {
    return (
        <div className={`relative w-full h-full ${className}`}>
            <Canvas
                shadows
                camera={{ position: [0, 1.5, 3], fov: 30 }}
                className="w-full h-full"
            >
                <ambientLight intensity={0.7} />
                <directionalLight
                    position={[5, 5, 5]}
                    intensity={1}
                    castShadow
                    shadow-mapSize={1024}
                />

                <Suspense fallback={null}>
                    {/* Environment provides realistic lighting/reflections from an HDRI */}
                    <Environment preset="city" />

                    {/* Main Avatar Character */}
                    <group position={[0, -1.6, 0]}>
                        <AvatarModel onLoaded={() => console.log('Avatar ready')} />
                        <AnimationController />

                        <ContactShadows
                            opacity={0.4}
                            scale={10}
                            blur={2}
                            far={4}
                            resolution={256}
                            color="#000000"
                        />
                    </group>
                </Suspense>

                {/* OrbitControls allow for rotating/zooming the camera - useful for debugging, might remove for production */}
                <OrbitControls
                    enablePan={false}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 2}
                    minDistance={2}
                    maxDistance={5}
                />
            </Canvas>

            {/* Loading Overlay (Optional) */}
            <div className="absolute top-0 left-0 p-2 pointer-events-none">
                <span className="text-xs text-white/50 font-mono">Avatar System v0.1</span>
            </div>
        </div>
    );
}
