import { NextRequest, NextResponse } from 'next/server';
import { validatePBAuth } from '../../../../lib/ai-helpers';

export async function POST(req: NextRequest) {
  try {
    const { pbToken } = await req.json();
    if (!pbToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { pb, userId } = await validatePBAuth(pbToken);

    // Delete user-owned data across all collections
    const collections = [
      { name: 'projects', filter: `user="${userId}"` },
      { name: 'photos', filter: `user="${userId}"` },
      { name: 'recipes', filter: `user="${userId}"` },
      { name: 'posts', filter: `user="${userId}"` },
      { name: 'comments', filter: `user="${userId}"` },
      { name: 'likes', filter: `user="${userId}"` },
      { name: 'follows', filter: `follower="${userId}" || following="${userId}"` },
      { name: 'armies', filter: `user="${userId}"` },
      { name: 'diary_entries', filter: `user="${userId}"` },
      { name: 'user_paints', filter: `user="${userId}"` },
      { name: 'notifications', filter: `user="${userId}" || actor="${userId}"` },
      { name: 'ai_quota', filter: `user="${userId}"` },
      { name: 'ai_usage', filter: `user="${userId}"` },
      { name: 'push_subscriptions', filter: `user="${userId}"` },
      { name: 'expo_push_tokens', filter: `user="${userId}"` },
      { name: 'activities', filter: `user="${userId}"` },
    ];

    for (const { name, filter } of collections) {
      try {
        const records = await pb.collection(name).getFullList({ filter });
        for (const record of records) {
          await pb.collection(name).delete(record.id);
        }
      } catch {
        // Collection may not exist — skip
      }
    }

    // Delete the user account itself
    await pb.collection('users').delete(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    const message = error instanceof Error ? error.message : 'Delete failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
