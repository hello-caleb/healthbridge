import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

// Simple in-memory rate limiter
// In production, use Redis or similar for distributed rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
        return false;
    }

    if (record.count >= RATE_LIMIT) {
        return true;
    }

    record.count++;
    return false;
}

// Input validation
const VALID_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const MAX_NAME_LENGTH = 64;

function validateInput(value: unknown, fieldName: string): string | null {
    if (typeof value !== 'string') {
        return `${fieldName} must be a string`;
    }
    if (value.length === 0) {
        return `${fieldName} is required`;
    }
    if (value.length > MAX_NAME_LENGTH) {
        return `${fieldName} must be ${MAX_NAME_LENGTH} characters or less`;
    }
    if (!VALID_NAME_REGEX.test(value)) {
        return `${fieldName} contains invalid characters (only alphanumeric, hyphens, and underscores allowed)`;
    }
    return null;
}

export async function POST(req: NextRequest) {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || req.headers.get('x-real-ip')
        || 'unknown';

    if (isRateLimited(ip)) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
                status: 429,
                headers: { 'Retry-After': '60' }
            }
        );
    }

    // Parse and validate request body
    let body: { room?: unknown; identity?: unknown };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { error: 'Invalid JSON body' },
            { status: 400 }
        );
    }

    const { room, identity } = body;

    // Validate room
    const roomError = validateInput(room, 'room');
    if (roomError) {
        return NextResponse.json({ error: roomError }, { status: 400 });
    }

    // Validate identity
    const identityError = validateInput(identity, 'identity');
    if (identityError) {
        return NextResponse.json({ error: identityError }, { status: 400 });
    }

    // Check server configuration
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
        console.error('LiveKit credentials not configured');
        return NextResponse.json(
            { error: 'Server configuration error' },
            { status: 500 }
        );
    }

    try {
        const token = new AccessToken(apiKey, apiSecret, {
            identity: identity as string,
            ttl: '1h',
        });

        token.addGrant({
            room: room as string,
            roomJoin: true,
            canPublish: true,
            canSubscribe: true,
        });

        const jwt = await token.toJwt();
        return NextResponse.json({ token: jwt });
    } catch (error) {
        console.error('Error generating token:', error);
        return NextResponse.json(
            { error: 'Failed to generate access token' },
            { status: 500 }
        );
    }
}
