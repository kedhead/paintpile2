import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '../../../../lib/email';

export async function POST(req: NextRequest) {
  const { name, email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

  const displayName = name || 'Painter';

  await sendEmail({
    to: email,
    subject: 'Welcome to Paintpile 🎨',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
        <tr><td style="text-align:center;padding-bottom:32px">
          <p style="margin:0;font-size:28px;font-weight:900;letter-spacing:.06em;color:#f0eeff">PAINTPILE</p>
          <p style="margin:8px 0 0;font-size:14px;color:#7a7898">The Community for Miniature Painters</p>
        </td></tr>
        <tr><td style="background:#16161e;border:1px solid rgba(124,58,237,.2);border-radius:16px;padding:32px">
          <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#f0eeff">Welcome, ${displayName}! 🎨</p>
          <p style="margin:0 0 24px;font-size:15px;color:#7a7898;line-height:1.6">
            Your Paintpile account is ready. Here are three things to get you started:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)">
              <p style="margin:0;font-size:14px;font-weight:600;color:#f0eeff">🎯 Create your first project</p>
              <p style="margin:4px 0 8px;font-size:13px;color:#7a7898">Track a miniature from backlog to complete.</p>
              <a href="https://thepaintpile.com/projects" style="display:inline-block;background:#7c3aed;color:#fff;font-size:13px;font-weight:700;padding:8px 18px;border-radius:8px;text-decoration:none">Go to Projects →</a>
            </td></tr>
            <tr><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)">
              <p style="margin:0;font-size:14px;font-weight:600;color:#f0eeff">🖌️ Add your paints</p>
              <p style="margin:4px 0 8px;font-size:13px;color:#7a7898">Catalogue your collection from 4,700+ paints.</p>
              <a href="https://thepaintpile.com/paints" style="display:inline-block;background:#7c3aed;color:#fff;font-size:13px;font-weight:700;padding:8px 18px;border-radius:8px;text-decoration:none">Browse Paints →</a>
            </td></tr>
            <tr><td style="padding:12px 0">
              <p style="margin:0;font-size:14px;font-weight:600;color:#f0eeff">👥 Find painters to follow</p>
              <p style="margin:4px 0 8px;font-size:13px;color:#7a7898">Get inspired by the community.</p>
              <a href="https://thepaintpile.com/feed?tab=people" style="display:inline-block;background:#7c3aed;color:#fff;font-size:13px;font-weight:700;padding:8px 18px;border-radius:8px;text-decoration:none">Explore Community →</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="text-align:center;padding-top:24px">
          <p style="margin:0;font-size:12px;color:#3e3c58">
            You're receiving this because you created an account at
            <a href="https://thepaintpile.com" style="color:#7c3aed;text-decoration:none">thepaintpile.com</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  return NextResponse.json({ ok: true });
}
