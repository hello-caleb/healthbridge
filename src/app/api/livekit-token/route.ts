import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export async function POST(req: NextRequest) {
    const { room, identity } = await req.json();

    if (!room || !identity) {
        return NextResponse.json({ error: 'room and identity are required' }, { status: 400 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
        return NextResponse.json({ error: 'LiveKit credentials not configured' }, { status: 500 });
    }

    const token = new AccessToken(apiKey, apiSecret, {
        identity,
        ttl: '1h',
    });

    token.addGrant({
        room,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
    });

    const jwt = await token.toJwt();
    return NextResponse.json({ token: jwt });
}
