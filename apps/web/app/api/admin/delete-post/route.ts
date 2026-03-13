import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '../../../../lib/admin-helpers';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No auth token' }, { status: 401 });
    }

    const pbToken = authHeader.replace('Bearer ', '');
    const { pb } = await validateAdminAuth(pbToken);

    const { postId } = await req.json();
    if (!postId) {
      return NextResponse.json({ error: 'Missing postId' }, { status: 400 });
    }

    // Delete the post (admin PB client has full access)
    await pb.collection('posts').delete(postId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message === 'Unauthorized' || message === 'Not an admin' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
