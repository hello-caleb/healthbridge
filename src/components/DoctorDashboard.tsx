'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    RotateCcw,
    Check,
    Volume2,
    VolumeX,
    Hand,
    MessageSquare,
    Clock,
    AlertTriangle,
    Settings,
    HelpCircle,
    Video,
    FileText,
} from 'lucide-react';
import { PatientHistoryModal } from './PatientHistoryModal';
import {
    useTracks,
    VideoTrack,
    useDataChannel,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import {
    TranslationPayload,
    SigningStatusPayload,
    ConversationEntry,
    getConversationHistory,
    addToHistory,
    deserializeMessage,
    serializeMessage,
    createRepeatRequest,
    createUnderstoodMessage,
} from '@/lib/session-communication';
import {
    ConfidenceResult,
    getConfidenceClass,
    getConfidenceIcon,
} from '@/lib/confidence-scorer';
import {
    loadSettings,
    saveSettings,
    playNotificationForConfidence,
    NotificationSettings,
    testSound,
} from '@/lib/notification-sounds';

// ============================================================================
// Types
// ============================================================================

interface DoctorDashboardProps {
    onRequestOnboarding?: () => void;
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Current Message Display - Large, prominent display of the latest translation
 */
function CurrentMessageDisplay({
    translation,
    onAskRepeat,
    onConfirmUnderstood,
    isSigningNow,
}: {
    translation: TranslationPayload | null;
    onAskRepeat: (reason: 'low_confidence' | 'manual') => void;
    onConfirmUnderstood: () => void;
    isSigningNow: boolean;
}) {
    if (isSigningNow) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-900/20 to-purple-800/10 rounded-2xl border border-purple-500/30">
                <div className="relative mb-4">
                    <Hand className="w-16 h-16 text-purple-400 animate-pulse" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full animate-ping" />
                </div>
                <p className="text-2xl font-bold text-purple-300 animate-pulse">Patient is signing...</p>
                <p className="text-sm text-purple-400/70 mt-2">Translation will appear when complete</p>
            </div>
        );
    }

    if (!translation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white/5 rounded-2xl border border-white/10">
                <MessageSquare className="w-12 h-12 text-white/20 mb-4" />
                <p className="text-lg text-white/40">Waiting for patient message...</p>
                <p className="text-sm text-white/20 mt-1">ASL translations will appear here</p>
            </div>
        );
    }

    const confidenceColor = getConfidenceClass(translation.confidence.level);
    const confidenceIcon = getConfidenceIcon(translation.confidence.level);
    const isLowConfidence = translation.confidence.score < 60;

    return (
        <div className={`flex-1 flex flex-col p-6 rounded-2xl border transition-all ${isLowConfidence
            ? 'bg-orange-900/10 border-orange-500/30'
            : 'bg-emerald-900/10 border-emerald-500/30'
            }`}>
            {/* Message content */}
            <div className="flex-1 flex items-center justify-center">
                <p className="text-3xl md:text-4xl font-bold text-white text-center leading-relaxed">
                    "{translation.text}"
                </p>
            </div>

            {/* Confidence indicator */}
            <div className="flex items-center justify-center gap-4 py-4 border-t border-white/10 mt-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 ${confidenceColor}`}>
                    <span className="text-xl">{confidenceIcon}</span>
                    <span className="text-lg font-bold">{translation.confidence.score}%</span>
                    <span className="text-sm opacity-70 capitalize">{translation.confidence.level}</span>
                </div>
                <span className="text-sm text-white/40">{translation.timestamp}</span>
            </div>

            {/* Explanation */}
            {translation.confidence.explanation && (
                <p className="text-sm text-white/50 text-center mb-4">
                    {translation.confidence.explanation}
                </p>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 justify-center">
                <button
                    onClick={() => onAskRepeat(isLowConfidence ? 'low_confidence' : 'manual')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isLowConfidence
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white/80'
                        }`}
                >
                    <RotateCcw className="w-5 h-5" />
                    Ask to Repeat
                </button>
                <button
                    onClick={onConfirmUnderstood}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all"
                >
                    <Check className="w-5 h-5" />
                    Understood
                </button>
            </div>
        </div>
    );
}

/**
 * Conversation History Panel
 */
function ConversationHistoryPanel({ history }: { history: ConversationEntry[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [history.length]);

    if (history.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-white/30 text-sm">
                <Clock className="w-4 h-4 mr-2" />
                No conversation history yet
            </div>
        );
    }

    return (
        <div ref={scrollRef} className="space-y-3 overflow-y-auto max-h-64">
            {history.map((entry) => {
                const isPatient = entry.type === 'patient_asl' || entry.type === 'patient_audio';
                const isASL = entry.type === 'patient_asl';

                return (
                    <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                        <div className={`p-1.5 rounded-full ${isPatient ? 'bg-purple-500/20' : 'bg-blue-500/20'
                            }`}>
                            {isASL ? (
                                <Hand className="w-4 h-4 text-purple-400" />
                            ) : (
                                <MessageSquare className="w-4 h-4 text-blue-400" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold uppercase ${isPatient ? 'text-purple-400' : 'text-blue-400'
                                    }`}>
                                    {isPatient ? 'Patient' : 'You'}
                                </span>
                                {isASL && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                                        ASL
                                    </span>
                                )}
                                <span className="text-xs text-white/30">{entry.timestamp}</span>
                                {entry.confidence && (
                                    <span className={`text-xs ${getConfidenceClass(entry.confidence.level)}`}>
                                        {getConfidenceIcon(entry.confidence.level)} {entry.confidence.score}%
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-white/80 truncate">{entry.text}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/**
 * Sound Settings Panel
 */
function SoundSettingsPanel({
    settings,
    onSettingsChange,
}: {
    settings: NotificationSettings;
    onSettingsChange: (settings: Partial<NotificationSettings>) => void;
}) {
    return (
        <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {settings.enabled ? (
                        <Volume2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                        <VolumeX className="w-5 h-5 text-white/40" />
                    )}
                    <span className="text-sm font-medium text-white/80">Sound Notifications</span>
                </div>
                <button
                    onClick={() => onSettingsChange({ enabled: !settings.enabled })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${settings.enabled ? 'bg-emerald-500' : 'bg-white/20'
                        }`}
                >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.enabled ? 'left-7' : 'left-1'
                        }`} />
                </button>
            </div>

            {settings.enabled && (
                <>
                    {/* Volume slider */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-white/50">Volume</span>
                            <span className="text-xs text-white/50">{settings.volume}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={settings.volume}
                            onChange={(e) => onSettingsChange({ volume: parseInt(e.target.value) })}
                            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Test buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => testSound('newMessage')}
                            className="flex-1 py-2 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-white/70 transition-colors"
                        >
                            Test Normal
                        </button>
                        <button
                            onClick={() => testSound('lowConfidence')}
                            className="flex-1 py-2 text-xs rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 transition-colors"
                        >
                            Test Low Confidence
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

/**
 * Patient Video with Status Overlay
 */
function PatientVideoWithStatus({
    signingStatus
}: {
    signingStatus: SigningStatusPayload | null;
}) {
    const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
    const remoteVideoTrack = tracks.find((trackRef) => !trackRef.participant.isLocal);

    return (
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/50 border border-white/10">
            {remoteVideoTrack ? (
                <VideoTrack
                    trackRef={remoteVideoTrack}
                    className="h-full w-full object-cover"
                />
            ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                    <div className="text-center">
                        <Video className="w-12 h-12 text-white/20 mx-auto mb-2" />
                        <p className="text-sm text-white/40">Waiting for patient video...</p>
                    </div>
                </div>
            )}

            {/* Signing status overlay */}
            {signingStatus?.isSigning && (
                <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-purple-500/90 backdrop-blur-sm">
                        <Hand className="w-5 h-5 text-white animate-pulse" />
                        <span className="text-sm font-bold text-white">Patient is signing...</span>
                    </div>
                </div>
            )}

            {/* Patient label */}
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm">
                <span className="text-sm font-bold text-white">Patient</span>
            </div>
        </div>
    );
}

// ============================================================================
// Main Component
// ============================================================================

export function DoctorDashboard({ onRequestOnboarding }: DoctorDashboardProps) {
    // State
    const [latestTranslation, setLatestTranslation] = useState<TranslationPayload | null>(null);
    const [signingStatus, setSigningStatus] = useState<SigningStatusPayload | null>(null);
    const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);
    const [soundSettings, setSoundSettings] = useState<NotificationSettings>(loadSettings());
    const [showSettings, setShowSettings] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    // LiveKit data channel
    const { send } = useDataChannel('healthbridge-session', (msg) => {
        // ReceivedDataMessage has a payload property that contains the Uint8Array
        handleIncomingMessage(msg.payload);
    });

    // Handle incoming messages
    const handleIncomingMessage = (rawMessage: Uint8Array) => {
        try {
            const text = new TextDecoder().decode(rawMessage);
            const message = deserializeMessage(text);

            if (!message) return;

            switch (message.type) {
                case 'translation':
                    const translationPayload = message.payload as TranslationPayload;
                    setLatestTranslation(translationPayload);
                    setSigningStatus(null); // Clear signing status

                    // Add to history
                    addToHistory({
                        type: 'patient_asl',
                        text: translationPayload.text,
                        confidence: translationPayload.confidence,
                        timestamp: translationPayload.timestamp,
                    });
                    setConversationHistory(getConversationHistory());

                    // Play notification
                    if (soundSettings.enabled) {
                        playNotificationForConfidence(translationPayload.confidence.level);
                    }
                    break;

                case 'signing_status':
                    setSigningStatus(message.payload as SigningStatusPayload);
                    break;
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    };

    // Send message helper
    const sendMessage = (message: any) => {
        if (!send) {
            console.warn('Data channel not available');
            return;
        }
        const encoder = new TextEncoder();
        send(encoder.encode(serializeMessage(message)), { reliable: true });
    };

    // Handle repeat request
    const handleAskRepeat = (reason: 'low_confidence' | 'manual') => {
        sendMessage(createRepeatRequest(reason, latestTranslation?.translationId));

        addToHistory({
            type: 'doctor_request',
            text: `Asked patient to sign again (${reason === 'low_confidence' ? 'low confidence' : 'clarification needed'})`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        setConversationHistory(getConversationHistory());
    };

    // Handle understood
    const handleUnderstood = () => {
        sendMessage(createUnderstoodMessage(latestTranslation?.translationId));
    };

    // Handle settings change
    const handleSettingsChange = (updates: Partial<NotificationSettings>) => {
        const newSettings = saveSettings(updates);
        setSoundSettings(newSettings);
    };

    // Load initial history
    useEffect(() => {
        setConversationHistory(getConversationHistory());
    }, []);

    return (
        <div className="h-screen flex flex-col bg-[#0a0a0a] text-white overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold">
                        <span className="text-white">Health</span>
                        <span className="text-emerald-400">Bridge</span>
                    </h1>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 font-bold uppercase">
                        Doctor View
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {/* Help button */}
                    {onRequestOnboarding && (
                        <button
                            onClick={onRequestOnboarding}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 transition-colors"
                        >
                            <HelpCircle className="w-5 h-5" />
                        </button>
                    )}

                    {/* Patient History Toggle */}
                    <button
                        onClick={() => setShowHistoryModal(true)}
                        className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors mr-2"
                        title="Search Patient History"
                    >
                        <FileText className="w-5 h-5" />
                    </button>

                    {/* Settings toggle */}
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 rounded-lg transition-colors ${showSettings
                            ? 'bg-white/20 text-white'
                            : 'bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80'
                            }`}
                    >
                        <Settings className="w-5 h-5" />
                    </button>

                    {/* Sound indicator */}
                    <button
                        onClick={() => handleSettingsChange({ enabled: !soundSettings.enabled })}
                        className={`p-2 rounded-lg transition-colors ${soundSettings.enabled
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-white/5 text-white/40'
                            }`}
                    >
                        {soundSettings.enabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex gap-4 p-4 overflow-hidden">
                {/* Left Column: Video + History */}
                <div className="flex-1 flex flex-col gap-4 min-w-0">
                    {/* Patient Video */}
                    <PatientVideoWithStatus signingStatus={signingStatus} />

                    {/* Conversation History */}
                    <div className="flex-1 rounded-2xl bg-white/5 border border-white/10 p-4 overflow-hidden">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-4 h-4 text-white/40" />
                            <h2 className="text-sm font-bold uppercase tracking-wider text-white/50">
                                Conversation History
                            </h2>
                        </div>
                        <ConversationHistoryPanel history={conversationHistory} />
                    </div>
                </div>

                {/* Right Column: Current Message + Settings */}
                <div className="w-[400px] flex flex-col gap-4 shrink-0">
                    {/* Current Message */}
                    <CurrentMessageDisplay
                        translation={latestTranslation}
                        onAskRepeat={handleAskRepeat}
                        onConfirmUnderstood={handleUnderstood}
                        isSigningNow={signingStatus?.isSigning ?? false}
                    />

                    {/* Settings Panel (collapsible) */}
                    {showSettings && (
                        <SoundSettingsPanel
                            settings={soundSettings}
                            onSettingsChange={handleSettingsChange}
                        />
                    )}

                    {/* Low confidence warning */}
                    {latestTranslation && latestTranslation.confidence.score < 50 && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
                            <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-orange-300">Low Confidence Translation</p>
                                <p className="text-xs text-orange-400/70 mt-1">
                                    Consider asking the patient to sign again for clarification.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Patient History Modal */}
            <PatientHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
            />
        </div>
    );
}

export default DoctorDashboard;
