import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '../../../../lib/admin-helpers';

export async function POST(req: NextRequest) {
  try {
    const { pbToken } = await req.json();

    if (!pbToken) {
      return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 });
    }

    const { pb } = await validateAdminAuth(pbToken);

    const nonCustomPaints = await pb.collection('paints').getFullList({
      filter: 'is_custom = false',
      fields: 'id',
    });

    let deleted = 0;
    let failed = 0;

    for (const paint of nonCustomPaints) {
      try {
        await pb.collection('paints').delete(paint.id);
        deleted++;
      } catch {
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      deleted,
      failed,
      total: nonCustomPaints.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to clear paints';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
