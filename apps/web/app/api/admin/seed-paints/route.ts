import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '../../../../lib/admin-helpers';

export async function GET(req: NextRequest) {
  try {
    const pbToken = req.nextUrl.searchParams.get('pbToken');
    if (!pbToken) {
      return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 });
    }

    const { pb } = await validateAdminAuth(pbToken);

    const allPaints = await pb.collection('paints').getFullList({ fields: 'brand' });

    const brandCounts: Record<string, number> = {};
    for (const paint of allPaints) {
      brandCounts[paint.brand] = (brandCounts[paint.brand] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      total: allPaints.length,
      brands: brandCounts,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get paint count';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { pbToken, paints } = await req.json();

    if (!pbToken || !paints || !Array.isArray(paints)) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const { pb } = await validateAdminAuth(pbToken);

    let created = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const paint of paints) {
      try {
        await pb.collection('paints').create({
          name: paint.name,
          brand: paint.brand,
          hex_color: paint.color,
          type: paint.type,
          is_custom: false,
        });
        created++;
      } catch (err) {
        failed++;
        if (errors.length < 10) {
          errors.push(`${paint.brand} - ${paint.name}: ${err instanceof Error ? err.message : 'unknown error'}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      created,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to seed paints';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
