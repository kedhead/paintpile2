import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

export async function POST(req: NextRequest) {
  try {
    const { expoPushToken, pbToken } = await req.json();

    if (!expoPushToken || !pbToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pb = new PocketBase(PB_URL);
    pb.authStore.save(pbToken);

    try {
      await pb.collection('users').authRefresh();
    } catch {
      return NextResponse.json({ error: 'Invalid auth' }, { status: 401 });
    }

    const userId = pb.authStore.record?.id;
    if (!userId) {
      return NextResponse.json({ error: 'No user' }, { status: 401 });
    }

    // Check if token already registered for this user
    try {
      const existing = await pb.collection('expo_push_tokens').getFirstListItem(
        `user="${userId}" && expo_token="${expoPushToken}"`,
      );
      // Already registered, update device name
      await pb.collection('expo_push_tokens').update(existing.id, {
        device_name: req.headers.get('user-agent') || '',
      });
    } catch {
      // Create new
      await pb.collection('expo_push_tokens').create({
        user: userId,
        expo_token: expoPushToken,
        device_name: req.headers.get('user-agent') || '',
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Expo push subscribe error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { expoPushToken, pbToken } = await req.json();

    if (!expoPushToken || !pbToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pb = new PocketBase(PB_URL);
    pb.authStore.save(pbToken);

    try {
      await pb.collection('users').authRefresh();
    } catch {
      return NextResponse.json({ error: 'Invalid auth' }, { status: 401 });
    }

    const userId = pb.authStore.record?.id;
    if (!userId) {
      return NextResponse.json({ error: 'No user' }, { status: 401 });
    }

    try {
      const existing = await pb.collection('expo_push_tokens').getFirstListItem(
        `user="${userId}" && expo_token="${expoPushToken}"`,
      );
      await pb.collection('expo_push_tokens').delete(existing.id);
    } catch {
      // Not found
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Expo push unsubscribe error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
