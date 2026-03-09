import { NextRequest, NextResponse } from 'next/server';
import { validatePBAuth } from '../../../../lib/ai-helpers';

export async function POST(request: NextRequest) {
  try {
    const { pbToken, sets } = await request.json();

    const { pb, user } = await validatePBAuth(pbToken);
    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    if (!sets || !Array.isArray(sets) || sets.length === 0) {
      return NextResponse.json({ success: false, error: 'No sets provided' }, { status: 400 });
    }

    let created = 0;
    let failed = 0;

    for (const set of sets) {
      try {
        // Check if set already exists by name + brand
        const existing = await pb.collection('paint_sets').getFullList({
          filter: `set_name="${set.setName}" && brand="${set.brand}"`,
          requestKey: null,
        });

        if (existing.length > 0) {
          // Update existing
          await pb.collection('paint_sets').update(existing[0].id, {
            paint_names: JSON.stringify(set.paintNames),
            paint_count: set.paintCount,
            description: set.description || '',
            source_url: set.sourceUrl || '',
          });
        } else {
          // Create new
          await pb.collection('paint_sets').create({
            set_name: set.setName,
            brand: set.brand,
            paint_names: JSON.stringify(set.paintNames),
            paint_count: set.paintCount,
            description: set.description || '',
            source_url: set.sourceUrl || '',
            is_curated: false,
          });
        }
        created++;
      } catch (error) {
        console.error(`Failed to save set "${set.setName}":`, error);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      created,
      failed,
      total: sets.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Save failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
