import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import PocketBase from 'pocketbase';

const pbUrl = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';

export async function POST(req: NextRequest) {
  try {
    const { secret, userId, grant } = await req.json();

    if (!secret || !userId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const adminSecret = process.env.ADMIN_SETUP_SECRET;
    if (!adminSecret) {
      return NextResponse.json({ success: false, error: 'Admin setup not configured' }, { status: 403 });
    }
    // Timing-safe comparison prevents timing-based secret enumeration
    const secretsMatch = secret.length === adminSecret.length &&
      crypto.timingSafeEqual(Buffer.from(secret), Buffer.from(adminSecret));
    if (!secretsMatch) {
      return NextResponse.json({ success: false, error: 'Invalid secret' }, { status: 403 });
    }

    const pb = new PocketBase(pbUrl);

    const updated = await pb.collection('users').update(userId, {
      role: grant ? 'admin' : 'user',
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update admin role';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
