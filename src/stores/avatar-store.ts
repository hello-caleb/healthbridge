import { create } from 'zustand';

export type AnimationState = 'IDLE' | 'PREPARING' | 'SIGNING' | 'COOLDOWN';

interface AvatarState {
    currentState: AnimationState;
    currentWord: string | null;
    queue: string[];

    // Actions
    addToQueue: (text: string) => void;
    playNext: () => void;
    setAnimationState: (state: AnimationState) => void;
    clearQueue: () => void;
}

export const useAvatarStore = create<AvatarState>((set, get) => ({
    currentState: 'IDLE',
    currentWord: null,
    queue: [],

    addToQueue: (text: string) => {
        // Split text into words if needed, or keep as phrases
        // For now, let's treat the input as a single phrase to be queued
        // A smarter tokenizer would go here
        const words = text.trim().split(/\s+/);
        set((state) => ({ queue: [...state.queue, ...words] }));

        // If idle, start playing
        if (get().currentState === 'IDLE') {
            get().playNext();
        }
    },

    playNext: () => {
        const { queue } = get();
        if (queue.length === 0) {
            set({ currentState: 'IDLE', currentWord: null });
            return;
        }

        const [nextWord, ...remaining] = queue;
        set({
            queue: remaining,
            currentWord: nextWord,
            currentState: 'SIGNING'
        });
    },

    setAnimationState: (state: AnimationState) => set({ currentState: state }),

    clearQueue: () => set({ queue: [], currentWord: null, currentState: 'IDLE' })
}));
