import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '../../../../lib/admin-helpers';

const COLLECTIONS = [
  'users',
  'projects',
  'paints',
  'armies',
  'recipes',
  'posts',
  'likes',
  'comments',
  'follows',
  'notifications',
];

export async function GET(req: NextRequest) {
  try {
    const pbToken = req.nextUrl.searchParams.get('pbToken');
    if (!pbToken) {
      return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 });
    }

    const { pb } = await validateAdminAuth(pbToken);

    const backup: Record<string, unknown[]> = {};
    const stats: Record<string, number> = {};

    for (const collection of COLLECTIONS) {
      try {
        const records = await pb.collection(collection).getFullList();
        backup[collection] = records;
        stats[collection] = records.length;
      } catch {
        backup[collection] = [];
        stats[collection] = 0;
      }
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      stats,
      data: backup,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="paintpile-backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create backup';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
