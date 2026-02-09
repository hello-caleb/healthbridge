'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary for HealthBridge
 * Provides accessible, high-contrast error recovery UI for DHH users
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });

        // In production, you could send this to an error reporting service
        // e.g., Sentry, LogRocket, etc.
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div
                    className="min-h-screen bg-slate-50 flex items-center justify-center p-6"
                    role="alert"
                    aria-live="assertive"
                >
                    <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border-2 border-red-200 p-8 text-center">
                        {/* Icon */}
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                            <AlertTriangle className="h-10 w-10 text-red-600" aria-hidden="true" />
                        </div>

                        {/* Title - Large for accessibility */}
                        <h1 className="text-3xl font-bold text-slate-900 mb-4">
                            Something Went Wrong
                        </h1>

                        {/* Description - Clear and reassuring */}
                        <p className="text-xl text-slate-600 mb-6 leading-relaxed">
                            The application encountered an unexpected error.
                            Don't worry — your session data is safe.
                        </p>

                        {/* Error details (collapsed by default for non-technical users) */}
                        {this.state.error && (
                            <details className="mb-6 text-left bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <summary className="text-sm font-medium text-slate-500 cursor-pointer hover:text-slate-700">
                                    Technical Details
                                </summary>
                                <pre className="mt-3 text-xs text-red-600 overflow-auto max-h-32 font-mono">
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}

                        {/* Action Buttons - Large touch targets for accessibility */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all"
                                aria-label="Try again without reloading the page"
                            >
                                <RefreshCw className="h-5 w-5" aria-hidden="true" />
                                Try Again
                            </button>

                            <button
                                onClick={this.handleReload}
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-200 text-slate-800 text-lg font-bold rounded-xl hover:bg-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-300 transition-all"
                                aria-label="Reload the entire page"
                            >
                                <Home className="h-5 w-5" aria-hidden="true" />
                                Reload Page
                            </button>
                        </div>

                        {/* Accessibility note */}
                        <p className="mt-6 text-sm text-slate-400">
                            If this problem persists, please contact support.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
