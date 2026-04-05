import webPush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@thepaintpile.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

interface PushSubscriptionRecord {
  id: string;
  endpoint: string;
  keys_p256dh: string;
  keys_auth: string;
}

export async function sendPushNotification(
  subscription: PushSubscriptionRecord,
  payload: PushPayload,
): Promise<boolean> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('VAPID keys not configured, skipping push');
    return false;
  }

  try {
    await webPush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys_p256dh,
          auth: subscription.keys_auth,
        },
      },
      JSON.stringify(payload),
    );
    return true;
  } catch (err: unknown) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    if (statusCode === 410 || statusCode === 404) {
      // Subscription expired — caller should delete it
      return false;
    }
    console.error('Push notification failed:', err);
    return false;
  }
}

export function getVapidPublicKey() {
  return VAPID_PUBLIC_KEY;
}

// ── Expo Push Notifications (for native mobile app) ──

interface ExpoPushPayload {
  title: string;
  body: string;
  url?: string;
}

export async function sendExpoPushNotification(
  expoToken: string,
  payload: ExpoPushPayload,
): Promise<boolean> {
  try {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        to: expoToken,
        title: payload.title,
        body: payload.body,
        sound: 'default',
        data: { url: payload.url || '/' },
      }),
    });

    const result = await res.json();
    if (result.data?.status === 'error') {
      console.error('Expo push error:', result.data.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Expo push notification failed:', err);
    return false;
  }
}
