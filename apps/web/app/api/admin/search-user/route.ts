import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '../../../../lib/admin-helpers';

export async function POST(req: NextRequest) {
  try {
    const { pbToken, email } = await req.json();

    if (!pbToken || !email) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const { pb } = await validateAdminAuth(pbToken);

    const user = await pb.collection('users').getFirstListItem(`email="${email}"`);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        ai_enabled: user.ai_enabled,
        subscription: user.subscription,
        created: user.created,
        updated: user.updated,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to search user';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
