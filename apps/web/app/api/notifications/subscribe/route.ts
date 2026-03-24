import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { getVapidPublicKey } from '../../../../lib/push';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

export async function GET() {
  return NextResponse.json({ vapidPublicKey: getVapidPublicKey() });
}

export async function POST(req: NextRequest) {
  try {
    const { subscription, pbToken } = await req.json();

    if (!subscription?.endpoint || !subscription?.keys || !pbToken) {
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

    // Check if subscription already exists for this endpoint
    try {
      const existing = await pb.collection('push_subscriptions').getFirstListItem(
        `user="${userId}" && endpoint="${subscription.endpoint}"`,
      );
      // Update existing
      await pb.collection('push_subscriptions').update(existing.id, {
        keys_p256dh: subscription.keys.p256dh,
        keys_auth: subscription.keys.auth,
        user_agent: req.headers.get('user-agent') || '',
      });
    } catch {
      // Create new
      await pb.collection('push_subscriptions').create({
        user: userId,
        endpoint: subscription.endpoint,
        keys_p256dh: subscription.keys.p256dh,
        keys_auth: subscription.keys.auth,
        user_agent: req.headers.get('user-agent') || '',
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Push subscribe error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { endpoint, pbToken } = await req.json();

    if (!endpoint || !pbToken) {
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
      const existing = await pb.collection('push_subscriptions').getFirstListItem(
        `user="${userId}" && endpoint="${endpoint}"`,
      );
      await pb.collection('push_subscriptions').delete(existing.id);
    } catch {
      // Not found, that's fine
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Push unsubscribe error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
