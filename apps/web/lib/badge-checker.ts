import type PocketBase from 'pocketbase';
import { BADGE_DEFINITIONS } from './badge-definitions';

export interface NewlyEarnedBadge {
  badgeId: string;
  badgeName: string;
  badgeIcon: string;
}

export async function checkAndAwardBadges(pb: PocketBase, userId: string): Promise<NewlyEarnedBadge[]> {
  const newlyEarned: NewlyEarnedBadge[] = [];

  try {
    // Get all badge definitions from DB
    const allBadges = await pb.collection('badges').getFullList();

    // Get user's already earned badges
    const earnedBadges = await pb.collection('user_badges').getFullList({
      filter: `user="${userId}"`,
      fields: 'badge',
    });
    const earnedBadgeIds = new Set(earnedBadges.map((ub) => ub.badge));

    // Gather user stats
    const stats = await gatherUserStats(pb, userId);

    // Check each badge
    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge.id)) continue;
      if (badge.trigger_type !== 'stat_milestone') continue;

      const userValue = stats[badge.trigger_field] || 0;
      if (userValue >= badge.trigger_value) {
        // Award badge
        await pb.collection('user_badges').create({
          user: userId,
          badge: badge.id,
          earned_at: new Date().toISOString(),
        });

        newlyEarned.push({
          badgeId: badge.id,
          badgeName: badge.name,
          badgeIcon: badge.icon || '',
        });

        // Create notification for badge earned
        try {
          await pb.collection('notifications').create({
            user: userId,
            type: 'badge_earned',
            actor_id: userId,
            actor_name: 'PaintPile',
            target_id: badge.id,
            target_type: 'badge',
            message: `You earned the "${badge.name}" badge! ${badge.icon || '🏆'}`,
            action_url: '/badges',
            read: false,
          });
        } catch {
          // Don't let notification failure block badge awarding
          console.error('Failed to create badge notification');
        }
      }
    }
  } catch (error) {
    console.error('Badge check failed:', error);
  }

  return newlyEarned;
}

async function gatherUserStats(pb: PocketBase, userId: string): Promise<Record<string, number>> {
  const stats: Record<string, number> = {};

  try {
    // Project counts
    const projects = await pb.collection('projects').getList(1, 1, { filter: `user="${userId}"` });
    stats.project_count = projects.totalItems;

    const completed = await pb.collection('projects').getList(1, 1, { filter: `user="${userId}" && status="completed"` });
    stats.completed_count = completed.totalItems;

    // Army count
    const armies = await pb.collection('armies').getList(1, 1, { filter: `user="${userId}"` });
    stats.army_count = armies.totalItems;

    // Recipe count
    const recipes = await pb.collection('recipes').getList(1, 1, { filter: `user="${userId}"` });
    stats.recipe_count = recipes.totalItems;

    // Follower count
    const followers = await pb.collection('follows').getList(1, 1, { filter: `following="${userId}"` });
    stats.follower_count = followers.totalItems;

    // Days since join
    const user = await pb.collection('users').getOne(userId, { fields: 'created' });
    stats.days_since_join = Math.floor((Date.now() - new Date(user.created).getTime()) / (1000 * 60 * 60 * 24));

    // Photo count
    try {
      const photos = await pb.collection('photos').getList(1, 1, { filter: `user="${userId}"` });
      stats.photo_count = photos.totalItems;
    } catch { stats.photo_count = 0; }

    // Paint inventory count
    try {
      const inventory = await pb.collection('user_paints').getList(1, 1, { filter: `user="${userId}"` });
      stats.paint_owned_count = inventory.totalItems;
    } catch { stats.paint_owned_count = 0; }

    // Comment count
    try {
      const comments = await pb.collection('comments').getList(1, 1, { filter: `user="${userId}"` });
      stats.comment_count = comments.totalItems;
    } catch { stats.comment_count = 0; }

    // Like given count
    try {
      const likes = await pb.collection('likes').getList(1, 1, { filter: `user="${userId}"` });
      stats.like_given_count = likes.totalItems;
    } catch { stats.like_given_count = 0; }

    // Diary count
    try {
      const diary = await pb.collection('diary_entries').getList(1, 1, { filter: `user="${userId}"` });
      stats.diary_count = diary.totalItems;
    } catch { stats.diary_count = 0; }

    // Challenge entry count
    try {
      const entries = await pb.collection('challenge_entries').getList(1, 1, { filter: `user="${userId}"` });
      stats.challenge_entry_count = entries.totalItems;
    } catch { stats.challenge_entry_count = 0; }
  } catch (error) {
    console.error('Failed to gather stats:', error);
  }

  return stats;
}
