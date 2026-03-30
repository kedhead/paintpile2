import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '../../../../lib/admin-helpers';

const N8N_WEBHOOK_URL = process.env.N8N_SOCIAL_WEBHOOK_URL || 'http://65.75.201.180:5678/webhook/social-post';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No auth token' }, { status: 401 });
    }

    const pbToken = authHeader.replace('Bearer ', '');
    await validateAdminAuth(pbToken);

    const formData = await req.formData();
    const message = formData.get('message') as string;
    const platforms = JSON.parse(formData.get('platforms') as string) as string[];
    const imageFile = formData.get('image') as File | null;
    const scheduledAt = formData.get('scheduledAt') as string | null;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    if (!platforms?.length) {
      return NextResponse.json({ error: 'Select at least one platform' }, { status: 400 });
    }

    // Build payload for n8n webhook
    const n8nPayload = new FormData();
    n8nPayload.append('message', message.trim());
    n8nPayload.append('platforms', JSON.stringify(platforms));
    if (scheduledAt) n8nPayload.append('scheduledAt', scheduledAt);
    if (imageFile && imageFile.size > 0) {
      n8nPayload.append('image', imageFile, imageFile.name);
    }

    const n8nRes = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: n8nPayload,
    });

    if (!n8nRes.ok) {
      const errText = await n8nRes.text().catch(() => 'Unknown error');
      return NextResponse.json(
        { error: `n8n webhook failed: ${errText}` },
        { status: 502 }
      );
    }

    const result = await n8nRes.json().catch(() => ({ ok: true }));

    return NextResponse.json({
      success: true,
      platforms,
      result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message === 'Unauthorized' || message === 'Not an admin' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
