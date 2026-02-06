'use client';

import React, { useMemo } from 'react';
import { SignState } from '@/hooks/use-hand-landmarker';
import {
    ConfidenceResult,
    getConfidenceClass,
    getConfidenceIcon
} from '@/lib/confidence-scorer';

/**
 * Props for ASLCaptureStatus component
 */
interface ASLCaptureStatusProps {
    /** Current sign detection state */
    signState: SignState;
    /** Whether hands are currently detected */
    handsDetected: boolean;
    /** Current movement velocity (0-1 normalized) */
    velocity?: number;
    /** Last translation result */
    lastTranslation?: string;
    /** Confidence result from scoring */
    confidence?: ConfidenceResult;
    /** Whether system is processing */
    isProcessing?: boolean;
    /** Callback to trigger re-sign */
    onRequestReSign?: () => void;
    /** Compact mode for smaller displays */
    compact?: boolean;
}

/**
 * State indicator configuration
 */
const STATE_CONFIG: Record<SignState, {
    label: string;
    color: string;
    bgColor: string;
    icon: string;
    description: string;
}> = {
    idle: {
        label: 'Ready',
        color: 'text-gray-500',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        icon: '👐',
        description: 'Show your hands to start signing',
    },
    preparing: {
        label: 'Hands Detected',
        color: 'text-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        icon: '✋',
        description: 'Hold still or begin signing...',
    },
    signing: {
        label: 'Signing',
        color: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        icon: '🤟',
        description: 'Keep signing, capturing frames...',
    },
    completing: {
        label: 'Processing',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        icon: '⏳',
        description: 'Hold still to complete...',
    },
};

/**
 * Velocity indicator bar
 */
function VelocityBar({ velocity }: { velocity: number }) {
    const normalizedVelocity = Math.min(1, Math.max(0, velocity * 50)); // Scale for visibility

    return (
        <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
                className="h-full bg-gradient-to-r from-blue-400 to-green-500 transition-all duration-100"
                style={{ width: `${normalizedVelocity * 100}%` }}
            />
        </div>
    );
}

/**
 * State progress dots
 */
function StateDots({ currentState }: { currentState: SignState }) {
    const states: SignState[] = ['idle', 'preparing', 'signing', 'completing'];
    const currentIndex = states.indexOf(currentState);

    return (
        <div className="flex items-center gap-1">
            {states.map((state, index) => (
                <div
                    key={state}
                    className={`
                        w-2 h-2 rounded-full transition-all duration-300
                        ${index < currentIndex
                            ? 'bg-green-500'
                            : index === currentIndex
                                ? 'bg-blue-500 scale-125'
                                : 'bg-gray-300 dark:bg-gray-600'
                        }
                    `}
                />
            ))}
        </div>
    );
}

/**
 * Confidence display
 */
function ConfidenceDisplay({ confidence, compact }: { confidence: ConfidenceResult; compact?: boolean }) {
    if (compact) {
        return (
            <span className={`text-sm font-medium ${getConfidenceClass(confidence.level)}`}>
                {getConfidenceIcon(confidence.level)} {confidence.score}%
            </span>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Confidence</span>
                <span className={`text-lg font-bold ${getConfidenceClass(confidence.level)}`}>
                    {getConfidenceIcon(confidence.level)} {confidence.score}%
                </span>
            </div>

            {/* Factor breakdown */}
            <div className="grid grid-cols-5 gap-1 text-xs">
                {Object.entries(confidence.factors).map(([key, value]) => (
                    <div key={key} className="text-center">
                        <div
                            className="h-8 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden relative"
                        >
                            <div
                                className="absolute bottom-0 w-full bg-blue-500 transition-all"
                                style={{ height: `${value}%` }}
                            />
                        </div>
                        <span className="text-gray-500 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim().slice(0, 4)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Explanation */}
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                {confidence.explanation}
            </p>

            {/* Alternatives */}
            {confidence.alternatives.length > 0 && (
                <div className="text-xs text-gray-500">
                    <span className="font-medium">Also could be: </span>
                    {confidence.alternatives.join(', ')}
                </div>
            )}
        </div>
    );
}

/**
 * ASLCaptureStatus Component
 * 
 * Visual feedback for ASL sign capture quality and status
 */
export function ASLCaptureStatus({
    signState,
    handsDetected,
    velocity = 0,
    lastTranslation,
    confidence,
    isProcessing,
    onRequestReSign,
    compact = false,
}: ASLCaptureStatusProps) {
    const config = STATE_CONFIG[signState];

    // Should show re-sign prompt?
    const shouldPromptReSign = useMemo(() => {
        return confidence && confidence.score < 50 && signState === 'idle';
    }, [confidence, signState]);

    // Compact mode
    if (compact) {
        return (
            <div className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full
                ${config.bgColor} transition-colors duration-300
            `}>
                <span className="text-lg">{config.icon}</span>
                <span className={`text-sm font-medium ${config.color}`}>
                    {config.label}
                </span>
                {confidence && <ConfidenceDisplay confidence={confidence} compact />}
            </div>
        );
    }

    // Full mode
    return (
        <div className={`
            rounded-xl p-4 ${config.bgColor}
            border border-gray-200 dark:border-gray-700
            transition-all duration-300
        `}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                        <h3 className={`font-semibold ${config.color}`}>
                            {config.label}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {isProcessing ? 'Analyzing sign...' : config.description}
                        </p>
                    </div>
                </div>
                <StateDots currentState={signState} />
            </div>

            {/* Hand detection indicator */}
            <div className="flex items-center gap-2 mb-3">
                <div className={`
                    w-3 h-3 rounded-full
                    ${handsDetected
                        ? 'bg-green-500 animate-pulse'
                        : 'bg-gray-400'
                    }
                `} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {handsDetected ? 'Hands visible' : 'No hands detected'}
                </span>
            </div>

            {/* Velocity indicator (only during signing) */}
            {signState === 'signing' && (
                <div className="mb-3">
                    <span className="text-xs text-gray-500 mb-1 block">Movement</span>
                    <VelocityBar velocity={velocity} />
                </div>
            )}

            {/* Last translation */}
            {lastTranslation && signState === 'idle' && (
                <div className="mb-3 p-2 bg-white dark:bg-gray-900 rounded-lg">
                    <span className="text-xs text-gray-500 block mb-1">Detected:</span>
                    <span className="text-lg font-medium">
                        &quot;{lastTranslation}&quot;
                    </span>
                </div>
            )}

            {/* Confidence display */}
            {confidence && signState === 'idle' && (
                <ConfidenceDisplay confidence={confidence} />
            )}

            {/* Re-sign prompt */}
            {shouldPromptReSign && onRequestReSign && (
                <button
                    onClick={onRequestReSign}
                    className="
                        w-full mt-3 py-2 px-4
                        bg-orange-500 hover:bg-orange-600
                        text-white font-medium rounded-lg
                        transition-colors duration-200
                        flex items-center justify-center gap-2
                    "
                >
                    <span>🔄</span>
                    <span>Low quality - Sign again?</span>
                </button>
            )}

            {/* Processing spinner */}
            {isProcessing && (
                <div className="flex items-center justify-center py-4">
                    <div className="
                        w-8 h-8 border-4 border-blue-500 border-t-transparent
                        rounded-full animate-spin
                    " />
                </div>
            )}
        </div>
    );
}

export default ASLCaptureStatus;
