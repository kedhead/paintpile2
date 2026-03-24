import type PocketBase from 'pocketbase';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL?.replace(':8090', '') || 'https://thepaintpile.com';

function fullUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${APP_URL}${path}`;
}

/**
 * Trigger multi-channel delivery (email + push) for a notification.
 * Non-blocking — failures are logged but don't throw.
 */
async function triggerDelivery(data: {
  userId: string;
  type: string;
  actorName: string;
  message: string;
  actionUrl?: string;
  targetName?: string;
  comment?: string;
}) {
  try {
    await fetch(`${APP_URL}/api/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    // Delivery failure should not block the caller
  }
}

/**
 * Notify all followers of a user that they posted something new.
 * Call this after a project is created/published.
 */
export async function notifyFollowersOfNewPost(
  pb: PocketBase,
  actorId: string,
  actorName: string,
  postId: string,
  postTitle: string,
  actionUrl: string,
) {
  try {
    const followers = await pb.collection('follows').getFullList({
      filter: `following="${actorId}"`,
      fields: 'follower',
    });

    await Promise.all(
      followers.map(async (f) => {
        const message = `${actorName} shared a new project: "${postTitle}"`;
        await pb.collection('notifications').create({
          user: f.follower,
          type: 'new_post',
          actor: actorId,
          target_id: postId,
          target_type: 'project',
          message,
          action_url: fullUrl(actionUrl),
          read: false,
        }).catch(() => {});

        triggerDelivery({
          userId: f.follower,
          type: 'new_post',
          actorName,
          message,
          actionUrl,
          targetName: postTitle,
        });
      })
    );
  } catch (error) {
    console.error('Failed to notify followers:', error);
  }
}

/**
 * Notify all users about a news post.
 * Call this after a news item is created.
 */
export async function notifyAllUsersOfNews(
  pb: PocketBase,
  newsId: string,
  newsTitle: string,
  newsType: string,
  actorId: string,
  actorName: string,
) {
  try {
    const users = await pb.collection('users').getFullList({ fields: 'id' });

    // Don't notify the author
    const recipients = users.filter((u) => u.id !== actorId);

    await Promise.all(
      recipients.map(async (u) => {
        const message = `New ${newsType}: ${newsTitle}`;
        await pb.collection('notifications').create({
          user: u.id,
          type: 'news',
          actor: actorId,
          target_id: newsId,
          target_type: 'post',
          message,
          action_url: fullUrl('/news'),
          read: false,
        }).catch(() => {});

        triggerDelivery({
          userId: u.id,
          type: 'news',
          actorName,
          message,
          actionUrl: '/news',
          targetName: newsTitle,
        });
      })
    );
  } catch (error) {
    console.error('Failed to notify users of news:', error);
  }
}
