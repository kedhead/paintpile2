const BASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL?.replace(':8090', '') || 'https://thepaintpile.com';

/** Escape user-controlled strings before interpolating into HTML email bodies */
function esc(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c] ?? c));
}

function layout(content: string, unsubscribeUrl: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0a0a0a;color:#e5e5e5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:24px">
      <h1 style="color:#e5e5e5;font-size:20px;margin:0">Paintpile</h1>
    </div>
    <div style="background:#171717;border-radius:8px;padding:24px;border:1px solid #262626">
      ${content}
    </div>
    <div style="text-align:center;margin-top:24px;font-size:12px;color:#737373">
      <a href="${unsubscribeUrl}" style="color:#737373">Unsubscribe</a> &middot;
      <a href="${BASE_URL}" style="color:#737373">Paintpile</a>
    </div>
  </div>
</body>
</html>`;
}

export function followEmail(actorName: string, actorUrl: string, userId: string) {
  return {
    subject: `${esc(actorName)} started following you on Paintpile`,
    html: layout(
      `<p style="margin:0 0 12px;font-size:15px"><strong>${esc(actorName)}</strong> started following you!</p>
       <a href="${BASE_URL}${esc(actorUrl)}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px">View Profile</a>`,
      `${BASE_URL}/settings/notifications?unsubscribe=${esc(userId)}&type=follows`,
    ),
  };
}

export function commentEmail(actorName: string, comment: string, targetName: string, actionUrl: string, userId: string) {
  const snippet = comment.length > 100 ? comment.slice(0, 100) + '...' : comment;
  return {
    subject: `${esc(actorName)} commented on "${esc(targetName)}"`,
    html: layout(
      `<p style="margin:0 0 8px;font-size:15px"><strong>${esc(actorName)}</strong> commented on <strong>${esc(targetName)}</strong>:</p>
       <p style="margin:0 0 16px;font-size:14px;color:#a3a3a3;border-left:3px solid #404040;padding-left:12px">${esc(snippet)}</p>
       <a href="${BASE_URL}${esc(actionUrl)}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px">View Comment</a>`,
      `${BASE_URL}/settings/notifications?unsubscribe=${esc(userId)}&type=comments`,
    ),
  };
}

export function digestEmail(notifications: Array<{ message: string; actionUrl: string }>, userId: string) {
  const items = notifications
    .slice(0, 10)
    .map((n) => `<li style="margin-bottom:8px"><a href="${BASE_URL}${esc(n.actionUrl)}" style="color:#60a5fa;text-decoration:none">${esc(n.message)}</a></li>`)
    .join('');
  const extra = notifications.length > 10 ? `<p style="font-size:13px;color:#737373">... and ${notifications.length - 10} more</p>` : '';

  return {
    subject: `You have ${notifications.length} new notifications on Paintpile`,
    html: layout(
      `<p style="margin:0 0 16px;font-size:15px">Here's what you missed:</p>
       <ul style="padding-left:20px;margin:0 0 16px">${items}</ul>
       ${extra}
       <a href="${BASE_URL}/notifications" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px">View All</a>`,
      `${BASE_URL}/settings/notifications?unsubscribe=${userId}&type=digest`,
    ),
  };
}
