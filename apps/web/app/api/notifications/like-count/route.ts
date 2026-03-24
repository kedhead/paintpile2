import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

export async function POST(req: NextRequest) {
  try {
    const { targetId, targetType, delta } = await req.json();

    if (!targetId || !targetType || typeof delta !== 'number') {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const collectionMap: Record<string, string> = {
      army: 'armies',
      recipe: 'recipes',
      project: 'projects',
      post: 'posts',
    };
    const collection = collectionMap[targetType];
    if (!collection) {
      return NextResponse.json({ error: 'Unknown target type' }, { status: 400 });
    }

    const pb = new PocketBase(PB_URL);
    const adminEmail = process.env.PB_ADMIN_EMAIL;
    const adminPassword = process.env.PB_ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      await pb.collection('_superusers').authWithPassword(adminEmail, adminPassword);
    }

    const target = await pb.collection(collection).getOne(targetId, { fields: 'like_count' });
    const newCount = Math.max(0, (target.like_count || 0) + delta);
    await pb.collection(collection).update(targetId, { like_count: newCount });

    return NextResponse.json({ ok: true, like_count: newCount });
  } catch (err) {
    console.error('Like count update error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
