import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { sendEmail, isRateLimited } from '../../../../lib/email';
import { sendPushNotification, sendExpoPushNotification } from '../../../../lib/push';
import { followEmail, commentEmail } from '../../../../emails/notification-templates';
import type { NotificationPreferences } from '@paintpile/shared';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@paintpile/shared';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

// Map notification type to preference key
function prefKey(type: string): keyof NotificationPreferences['inApp'] | null {
  const map: Record<string, keyof NotificationPreferences['inApp']> = {
    follow: 'follows',
    like: 'likes',
    comment: 'comments',
    comment_reply: 'commentReplies',
    mention: 'mentions',
  };
  return map[type] || null;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, type, actorName, message, actionUrl, targetName, comment } = await req.json();

    if (!userId || !type) {
      return NextResponse.json({ error: 'Missing userId or type' }, { status: 400 });
    }

    const pb = new PocketBase(PB_URL);
    // Use admin auth for server-side operations
    const adminEmail = process.env.PB_ADMIN_EMAIL;
    const adminPassword = process.env.PB_ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      await pb.collection('_superusers').authWithPassword(adminEmail, adminPassword);
    }

    const recipient = await pb.collection('users').getOne(userId);
    const prefs: NotificationPreferences = recipient.notification_preferences || DEFAULT_NOTIFICATION_PREFERENCES;
    const key = prefKey(type);

    const results = { email: false, push: false };

    // Email delivery
    if (key && prefs.email.enabled && prefs.email[key] && recipient.email && !prefs.email.digestMode) {
      if (!isRateLimited(userId, type)) {
        let emailData: { subject: string; html: string } | null = null;

        if (type === 'follow') {
          emailData = followEmail(actorName, actionUrl || `/profile/${userId}`, userId);
        } else if (type === 'comment' || type === 'comment_reply') {
          emailData = commentEmail(actorName, comment || message, targetName || '', actionUrl || '', userId);
        }

        if (emailData) {
          const sent = await sendEmail({ to: recipient.email, ...emailData });
          results.email = !!sent;
        }
      }
    }

    // Push delivery
    if (key && prefs.push.enabled && prefs.push[key]) {
      try {
        const subscriptions = await pb.collection('push_subscriptions').getFullList({
          filter: `user="${userId}"`,
        });

        for (const sub of subscriptions) {
          const success = await sendPushNotification({
            id: sub.id,
            endpoint: sub.endpoint,
            keys_p256dh: sub.keys_p256dh,
            keys_auth: sub.keys_auth,
          }, {
            title: 'Paintpile',
            body: message,
            icon: '/icon-192.png',
            url: actionUrl || '/',
          });

          if (!success) {
            // Clean up expired subscription
            try {
              await pb.collection('push_subscriptions').delete(sub.id);
            } catch {
              // ignore cleanup errors
            }
          } else {
            results.push = true;
          }
        }
      } catch {
        // push_subscriptions collection may not exist yet
      }

      // Expo push notifications (native mobile app)
      try {
        const expoTokens = await pb.collection('expo_push_tokens').getFullList({
          filter: `user="${userId}"`,
        });

        for (const tokenRecord of expoTokens) {
          const success = await sendExpoPushNotification(tokenRecord.expo_token, {
            title: 'Paintpile',
            body: message,
            url: actionUrl || '/',
          });

          if (!success) {
            // Clean up invalid token
            try {
              await pb.collection('expo_push_tokens').delete(tokenRecord.id);
            } catch {
              // ignore cleanup errors
            }
          } else {
            results.push = true;
          }
        }
      } catch {
        // expo_push_tokens collection may not exist yet
      }
    }

    return NextResponse.json({ ok: true, ...results });
  } catch (err) {
    console.error('Notification send error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
