import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import PocketBase from 'pocketbase';
import { getDisplayName } from '@paintpile/shared';

export async function POST(req: NextRequest) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const pbUrl = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'LiveKit not configured' }, { status: 500 });
  }

  const { streamerId, pbToken, role } = await req.json();

  if (!streamerId || !pbToken || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Validate PocketBase auth token
  const pb = new PocketBase(pbUrl);
  pb.authStore.save(pbToken);

  try {
    const authResult = await pb.collection('users').authRefresh();
    const userId = authResult.record.id;
    const displayName = getDisplayName(authResult.record, 'User');

    const roomName = `feed_live_${streamerId}`;

    // Broadcasters can only create tokens for their own stream
    if (role === 'broadcaster' && userId !== streamerId) {
      return NextResponse.json({ error: 'Cannot broadcast for another user' }, { status: 403 });
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity: userId,
      name: displayName,
    });

    if (role === 'broadcaster') {
      token.addGrant({
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canPublishData: true,
        canSubscribe: true,
      });
    } else {
      // Viewer — can subscribe but not publish
      token.addGrant({
        room: roomName,
        roomJoin: true,
        canPublish: false,
        canPublishData: false,
        canSubscribe: true,
      });
    }

    const jwt = await token.toJwt();

    return NextResponse.json({ token: jwt, room: roomName });
  } catch {
    return NextResponse.json({ error: 'Invalid auth token' }, { status: 401 });
  }
}
