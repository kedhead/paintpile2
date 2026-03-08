import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '../../../../lib/admin-helpers';

export async function POST(req: NextRequest) {
  try {
    const { pbToken, userId, aiEnabled, proTier, role } = await req.json();

    if (!pbToken || !userId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const { pb } = await validateAdminAuth(pbToken);

    const updateData: Record<string, unknown> = {};
    if (aiEnabled !== undefined) updateData.ai_enabled = aiEnabled;
    if (proTier !== undefined) updateData.subscription = proTier ? 'pro' : 'free';
    if (role !== undefined) updateData.role = role;

    const updated = await pb.collection('users').update(userId, updateData);

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        username: updated.username,
        role: updated.role,
        ai_enabled: updated.ai_enabled,
        subscription: updated.subscription,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
