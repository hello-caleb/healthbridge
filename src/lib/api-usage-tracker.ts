export interface DailyUsage {
    date: string;
    aslRequests: number;
    realtimeRequests: number;
    jargonRequests: number;
}

const STORAGE_KEY = 'healthbridge_api_usage';

// Free tier approximate limits (conservative estimates)
// Gemini Flash: 15 RPM, 1,500 RPD
export const API_LIMITS = {
    DAILY_TOTAL_REQUESTS: 1000, // Safe buffer below 1500
    MINUTE_RATE_LIMIT: 15,
};

export const ApiUsageTracker = {
    getUsage: (): DailyUsage => {
        if (typeof window === 'undefined') return { date: '', aslRequests: 0, realtimeRequests: 0, jargonRequests: 0 };

        const stored = localStorage.getItem(STORAGE_KEY);
        const today = new Date().toISOString().split('T')[0];

        if (stored) {
            const usage: DailyUsage = JSON.parse(stored);
            if (usage.date === today) {
                return usage;
            }
        }

        // Reset if date changed or no data
        const newUsage: DailyUsage = {
            date: today,
            aslRequests: 0,
            realtimeRequests: 0,
            jargonRequests: 0
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsage));
        return newUsage;
    },

    increment: (type: 'asl' | 'realtime' | 'jargon') => {
        if (typeof window === 'undefined') return;

        const usage = ApiUsageTracker.getUsage();

        switch (type) {
            case 'asl':
                usage.aslRequests++;
                break;
            case 'realtime':
                usage.realtimeRequests++;
                break;
            case 'jargon':
                usage.jargonRequests++;
                break;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
        return usage;
    },

    checkAvailability: (type: 'asl' | 'realtime' | 'jargon'): boolean => {
        const usage = ApiUsageTracker.getUsage();
        const total = usage.aslRequests + usage.realtimeRequests + usage.jargonRequests;
        return total < API_LIMITS.DAILY_TOTAL_REQUESTS;
    },

    getRemaining: () => {
        const usage = ApiUsageTracker.getUsage();
        const total = usage.aslRequests + usage.realtimeRequests + usage.jargonRequests;
        return Math.max(0, API_LIMITS.DAILY_TOTAL_REQUESTS - total);
    }
};
