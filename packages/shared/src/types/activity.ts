export type ActivityType =
  | 'project_created'
  | 'project_completed'
  | 'project_liked'
  | 'army_created'
  | 'army_liked'
  | 'recipe_created'
  | 'recipe_liked'
  | 'user_followed'
  | 'comment_created'
  | 'project_updated'
  | 'army_updated'
  | 'project_critique_shared'
  | 'post_created'
  | 'user_joined';

export type ActivityTargetType =
  | 'project'
  | 'army'
  | 'recipe'
  | 'comment'
  | 'user'
  | 'post';

export interface ActivityMetadata {
  projectName?: string;
  projectPhotoUrl?: string;
  armyName?: string;
  armyPhotoUrl?: string;
  recipeName?: string;
  targetUsername?: string;
  targetDisplayName?: string;
  targetUserPhotoUrl?: string;
  commentText?: string;
  commentPreview?: string;
  targetName?: string;
  critiqueScore?: number;
  critiqueGrade?: string;
  status?: string;
  visibility?: 'public' | 'private';
  targetPhotoUrl?: string;
  description?: string;
  likeCount?: number;
  commentCount?: number;
  faction?: string;
}

export interface Activity {
  activityId: string;
  userId: string;
  username: string;
  userPhotoUrl?: string;
  type: ActivityType;
  targetId: string;
  targetType: ActivityTargetType;
  metadata: ActivityMetadata;
  createdAt: string;
}

export type CreateActivityData = Omit<Activity, 'activityId' | 'createdAt'>;

export interface ActivityFeedItem extends Activity {
  isPinned?: boolean;
  isHighlighted?: boolean;
}

export interface ActivityFilter {
  types?: ActivityType[];
  userId?: string;
  targetType?: ActivityTargetType;
  startDate?: Date;
  endDate?: Date;
}

export type ActivityFeedType = 'user' | 'following' | 'global';

export const ACTIVITY_MESSAGES: Record<ActivityType, (metadata: ActivityMetadata) => string> = {
  project_created: (m) => `created a new project: ${m.projectName}`,
  project_completed: (m) => `completed project: ${m.projectName}`,
  project_liked: (m) => `liked project: ${m.projectName}`,
  army_created: (m) => `created a new army: ${m.armyName}`,
  army_liked: (m) => `liked army: ${m.armyName}`,
  recipe_created: (m) => `created a new recipe: ${m.recipeName}`,
  recipe_liked: (m) => `liked recipe: ${m.recipeName}`,
  user_followed: (m) => `followed ${m.targetUsername}`,
  comment_created: (m) => `commented: "${m.commentPreview || m.commentText}"`,
  project_updated: (m) => `updated project: ${m.projectName}`,
  army_updated: (m) => `updated army: ${m.armyName}`,
  project_critique_shared: (m) => `scored a ${m.critiqueScore}/100 on ${m.projectName}`,
  post_created: (m) => `shared a new post`,
  user_joined: () => `joined the paintpile`,
};
