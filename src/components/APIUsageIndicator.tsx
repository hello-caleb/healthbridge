'use client';

import React, { useEffect, useState } from 'react';
import { ApiUsageTracker, API_LIMITS } from '@/lib/api-usage-tracker';

export function APIUsageIndicator() {
    const [usage, setUsage] = useState({ total: 0, percent: 0 });

    const updateUsage = () => {
        const stats = ApiUsageTracker.getUsage();
        const total = stats.aslRequests + stats.jargonRequests + stats.realtimeRequests;
        const percent = Math.min(100, (total / API_LIMITS.DAILY_TOTAL_REQUESTS) * 100);
        setUsage({ total, percent });
        console.log('API Usage:', total, '/', API_LIMITS.DAILY_TOTAL_REQUESTS);
    };

    useEffect(() => {
        // Update initially
        updateUsage();

        // Check for updates every 5 seconds or whenever local storage changes
        const interval = setInterval(updateUsage, 5000);

        // Listen for storage events (updates from other tabs)
        window.addEventListener('storage', updateUsage);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', updateUsage);
        };
    }, []);

    // Also trigger update on click to refresh explicitly
    return (
        <div
            onClick={updateUsage}
            className="fixed bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-lg z-50 text-xs font-mono cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="API Usage Today (Free Tier)"
        >
            <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${usage.percent > 90 ? 'bg-red-500 animate-pulse' : usage.percent > 75 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                <span className="text-gray-600 dark:text-gray-300 font-semibold">API Usage</span>
                <span className="text-gray-400">|</span>
                <span className={usage.percent > 90 ? 'text-red-500 font-bold' : 'text-gray-600 dark:text-gray-300'}>
                    {usage.total} / {API_LIMITS.DAILY_TOTAL_REQUESTS}
                </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ${usage.percent > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${usage.percent}%` }}
                />
            </div>
        </div>
    );
}
