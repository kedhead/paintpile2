import type PocketBase from 'pocketbase';

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
      followers.map((f) =>
        pb.collection('notifications').create({
          user: f.follower,
          type: 'new_post',
          actor_id: actorId,
          actor_name: actorName,
          target_id: postId,
          target_type: 'project',
          message: `${actorName} shared a new project: "${postTitle}"`,
          action_url: actionUrl,
          read: false,
        }).catch(() => {
          // Don't let individual notification failures block the rest
        })
      )
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
      recipients.map((u) =>
        pb.collection('notifications').create({
          user: u.id,
          type: 'news',
          actor_id: actorId,
          actor_name: actorName,
          target_id: newsId,
          target_type: 'post',
          message: `New ${newsType}: ${newsTitle}`,
          action_url: '/news',
          read: false,
        }).catch(() => {
          // Don't let individual notification failures block the rest
        })
      )
    );
  } catch (error) {
    console.error('Failed to notify users of news:', error);
  }
}
