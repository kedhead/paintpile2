import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

const pbUrl = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';

export async function POST(req: NextRequest) {
  try {
    const { pbToken } = await req.json();
    if (!pbToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const pb = new PocketBase(pbUrl);
    pb.authStore.save(pbToken);

    const authResult = await pb.collection('users').authRefresh();
    const userId = authResult.record.id;

    // Gather all user data
    const [projects, recipes, armies, posts, likes, follows, comments] = await Promise.all([
      pb.collection('projects').getFullList({ filter: `user="${userId}"` }).catch(() => []),
      pb.collection('recipes').getFullList({ filter: `user="${userId}"` }).catch(() => []),
      pb.collection('armies').getFullList({ filter: `user="${userId}"` }).catch(() => []),
      pb.collection('posts').getFullList({ filter: `user="${userId}"` }).catch(() => []),
      pb.collection('likes').getFullList({ filter: `user="${userId}"` }).catch(() => []),
      pb.collection('follows').getFullList({ filter: `follower="${userId}"` }).catch(() => []),
      pb.collection('comments').getFullList({ filter: `user="${userId}"` }).catch(() => []),
    ]);

    // Optional collections that may not exist
    let photos: unknown[] = [];
    let diary: unknown[] = [];
    let inventory: unknown[] = [];
    try { photos = await pb.collection('photos').getFullList({ filter: `user="${userId}"` }); } catch {}
    try { diary = await pb.collection('diary_entries').getFullList({ filter: `user="${userId}"` }); } catch {}
    try { inventory = await pb.collection('user_paints').getFullList({ filter: `user="${userId}"` }); } catch {}

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: userId,
        name: authResult.record.name,
        email: authResult.record.email,
        username: authResult.record.username,
        bio: authResult.record.bio,
        created: authResult.record.created,
      },
      projects,
      recipes,
      armies,
      posts,
      photos,
      diary,
      inventory,
      likes,
      follows,
      comments,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="paintpile-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
