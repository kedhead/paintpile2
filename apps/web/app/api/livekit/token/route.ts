import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import PocketBase from 'pocketbase';

export async function POST(req: NextRequest) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const pbUrl = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'LiveKit not configured' }, { status: 500 });
  }

  const { groupId, channelId, pbToken } = await req.json();

  if (!groupId || !channelId || !pbToken) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Validate PocketBase auth token
  const pb = new PocketBase(pbUrl);
  pb.authStore.save(pbToken, null);

  try {
    const user = await pb.collection('users').authRefresh();
    const userId = user.record.id;
    const displayName = user.record.name || user.record.displayName || 'User';

    // Verify user is a member of the group
    const memberships = await pb.collection('group_members').getFullList({
      filter: `group = "${groupId}" && user = "${userId}"`,
    });

    if (memberships.length === 0) {
      return NextResponse.json({ error: 'Not a group member' }, { status: 403 });
    }

    // Generate LiveKit token
    const roomName = `group_${groupId}_channel_${channelId}`;
    const token = new AccessToken(apiKey, apiSecret, {
      identity: userId,
      name: displayName,
    });

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();

    return NextResponse.json({ token: jwt, room: roomName });
  } catch {
    return NextResponse.json({ error: 'Invalid auth token' }, { status: 401 });
  }
}
