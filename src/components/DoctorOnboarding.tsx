'use client';

/**
 * DoctorOnboarding
 * 
 * Interactive onboarding tutorial for new doctors using the dashboard.
 * Guides through the main features with step-by-step highlights.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    X,
    ChevronRight,
    ChevronLeft,
    Hand,
    MessageSquare,
    RotateCcw,
    Check,
    Volume2,
    Clock,
    Sparkles,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType | any; // Using any to bypass strict LucideIcon type issues for now
    highlight?: string; // CSS selector to highlight
    position: 'center' | 'bottom-left' | 'bottom-right' | 'top-right';
}

interface DoctorOnboardingProps {
    onComplete: () => void;
    onSkip?: () => void;
    isFirstTime?: boolean;
}

// ============================================================================
// Steps Configuration
// ============================================================================

const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to HealthBridge',
        description: 'This dashboard helps you communicate with deaf and hard-of-hearing patients through real-time ASL translation. Let\'s take a quick tour.',
        icon: Sparkles,
        position: 'center',
    },
    {
        id: 'video',
        title: 'Patient Video Feed',
        description: 'Watch your patient sign in real-time. The system will automatically detect when they begin and end signing.',
        icon: Hand,
        position: 'bottom-left',
    },
    {
        id: 'translation',
        title: 'Real-Time Translation',
        description: 'ASL translations appear here with confidence scores. Green indicates high confidence, amber/orange indicates the translation may need verification.',
        icon: MessageSquare,
        position: 'bottom-right',
    },
    {
        id: 'actions',
        title: 'Action Buttons',
        description: 'Click "Ask to Repeat" if a translation is unclear. Click "Understood" to confirm you received the message. These feedback signals help improve future translations.',
        icon: RotateCcw,
        position: 'bottom-right',
    },
    {
        id: 'signing-indicator',
        title: '"Patient is Signing" Indicator',
        description: 'When your patient begins signing, you\'ll see a live indicator. The translation will appear once they complete their sign.',
        icon: Hand,
        position: 'center',
    },
    {
        id: 'history',
        title: 'Conversation History',
        description: 'Review past messages and their confidence levels. This helps track the flow of conversation and identify any points that may need clarification.',
        icon: Clock,
        position: 'bottom-left',
    },
    {
        id: 'sounds',
        title: 'Audio Notifications',
        description: 'Subtle sounds alert you to new messages and low-confidence translations. Toggle these on/off using the speaker icon in the header.',
        icon: Volume2,
        position: 'top-right',
    },
    {
        id: 'done',
        title: 'You\'re All Set!',
        description: 'Start your consultation. You can revisit this tutorial anytime using the help icon in the header. Good luck!',
        icon: Check,
        position: 'center',
    },
];

const STORAGE_KEY = 'healthbridge-doctor-onboarding-complete';

// ============================================================================
// Component
// ============================================================================

export function DoctorOnboarding({
    onComplete,
    onSkip,
    isFirstTime = false,
}: DoctorOnboardingProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // Check if onboarding was completed before
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const completed = localStorage.getItem(STORAGE_KEY);
            if (completed === 'true' && !isFirstTime) {
                setIsVisible(false);
            }
        }
    }, [isFirstTime]);

    const step = ONBOARDING_STEPS[currentStep];
    const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
    const isFirstStep = currentStep === 0;

    const handleNext = useCallback(() => {
        if (isLastStep) {
            localStorage.setItem(STORAGE_KEY, 'true');
            setIsVisible(false);
            onComplete();
        } else {
            setCurrentStep((prev) => prev + 1);
        }
    }, [isLastStep, onComplete]);

    const handlePrev = useCallback(() => {
        if (!isFirstStep) {
            setCurrentStep((prev) => prev - 1);
        }
    }, [isFirstStep]);

    const handleSkip = useCallback(() => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setIsVisible(false);
        onSkip?.();
    }, [onSkip]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isVisible) return;

            if (e.key === 'ArrowRight' || e.key === 'Enter') {
                handleNext();
            } else if (e.key === 'ArrowLeft') {
                handlePrev();
            } else if (e.key === 'Escape') {
                handleSkip();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isVisible, handleNext, handlePrev, handleSkip]);

    if (!isVisible) return null;

    const Icon = step.icon;

    // Position classes
    const positionClasses = {
        'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
        'bottom-left': 'bottom-8 left-8',
        'bottom-right': 'bottom-8 right-8',
        'top-right': 'top-20 right-8',
    };

    return (
        <div className="fixed inset-0 z-[100]">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Tutorial Card */}
            <div className={`
                absolute ${positionClasses[step.position]}
                w-full max-w-md mx-4
                animate-in fade-in slide-in-from-bottom-4 duration-300
            `}>
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                    {/* Progress bar */}
                    <div className="h-1 bg-white/10">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                            style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
                        />
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {/* Skip button */}
                        {!isLastStep && (
                            <button
                                onClick={handleSkip}
                                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}

                        {/* Icon */}
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                            <Icon size={32} className="text-emerald-400" />
                        </div>

                        {/* Step counter */}
                        <div className="text-center mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-white/40">
                                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
                            </span>
                        </div>

                        {/* Title & Description */}
                        <h2 className="text-2xl font-bold text-white text-center mb-4">
                            {step.title}
                        </h2>
                        <p className="text-white/70 text-center leading-relaxed mb-8">
                            {step.description}
                        </p>

                        {/* Navigation */}
                        <div className="flex items-center gap-3">
                            {!isFirstStep && (
                                <button
                                    onClick={handlePrev}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-medium transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Back
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className={`
                                    flex-1 flex items-center justify-center gap-2 py-3 rounded-xl 
                                    font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98]
                                    ${isLastStep
                                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                                        : 'bg-white/10 hover:bg-white/15 text-white'
                                    }
                                `}
                            >
                                {isLastStep ? 'Get Started' : 'Next'}
                                {!isLastStep && <ChevronRight className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Step indicators */}
                        <div className="flex items-center justify-center gap-2 mt-6">
                            {ONBOARDING_STEPS.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentStep(index)}
                                    className={`
                                        w-2 h-2 rounded-full transition-all
                                        ${index === currentStep
                                            ? 'w-6 bg-emerald-400'
                                            : index < currentStep
                                                ? 'bg-emerald-500/50'
                                                : 'bg-white/20'
                                        }
                                    `}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Keyboard hint */}
                <div className="text-center mt-4">
                    <span className="text-xs text-white/30">
                        Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/50 ml-1">→</kbd> to continue or <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/50 mx-1">Esc</kbd> to skip
                    </span>
                </div>
            </div>
        </div>
    );
}

/**
 * Hook to manage onboarding state
 */
export function useDoctorOnboarding() {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const completed = localStorage.getItem(STORAGE_KEY);
            setHasSeenOnboarding(completed === 'true');
            setShowOnboarding(completed !== 'true');
        }
    }, []);

    const triggerOnboarding = useCallback(() => {
        setShowOnboarding(true);
    }, []);

    const completeOnboarding = useCallback(() => {
        setShowOnboarding(false);
        setHasSeenOnboarding(true);
    }, []);

    const resetOnboarding = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setHasSeenOnboarding(false);
    }, []);

    return {
        showOnboarding,
        hasSeenOnboarding,
        triggerOnboarding,
        completeOnboarding,
        resetOnboarding,
    };
}

export default DoctorOnboarding;
