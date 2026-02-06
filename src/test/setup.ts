import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock performance.now for tests
if (typeof performance === 'undefined') {
    (global as any).performance = {
        now: () => Date.now(),
    };
}

// Mock requestAnimationFrame
if (typeof requestAnimationFrame === 'undefined') {
    (global as any).requestAnimationFrame = (callback: FrameRequestCallback): number => {
        return setTimeout(() => callback(Date.now()), 16) as unknown as number;
    };
}

if (typeof cancelAnimationFrame === 'undefined') {
    (global as any).cancelAnimationFrame = (id: number): void => {
        clearTimeout(id);
    };
}

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
    value: {
        getUserMedia: vi.fn().mockResolvedValue({
            getTracks: () => [{ stop: vi.fn() }],
        }),
    },
    writable: true,
});

// Mock HTMLVideoElement
Object.defineProperty(HTMLVideoElement.prototype, 'play', {
    value: vi.fn().mockResolvedValue(undefined),
    writable: true,
});

Object.defineProperty(HTMLVideoElement.prototype, 'pause', {
    value: vi.fn(),
    writable: true,
});

Object.defineProperty(HTMLVideoElement.prototype, 'readyState', {
    get: () => 4, // HAVE_ENOUGH_DATA
    configurable: true,
});
