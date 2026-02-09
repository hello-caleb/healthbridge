import { NextResponse } from 'next/server';

/**
 * Health check endpoint for deployment monitoring
 * Used by Vercel, Cloud Run, or other platforms for readiness probes
 */
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '0.1.0',
    });
}
