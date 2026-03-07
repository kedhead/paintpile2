export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';

export type BadgeCategory =
  | 'projects'
  | 'armies'
  | 'recipes'
  | 'social'
  | 'community'
  | 'special'
  | 'time'
  | 'engagement';

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  tier: BadgeTier;
  icon: string;
  color: string;
  requirement: string;
  points: number;
  hidden?: boolean;
  createdAt?: string;
  trigger_type?: 'manual' | 'stat_milestone';
  trigger_field?: string;
  trigger_value?: number;
}

export interface UserBadge {
  badgeId: string;
  userId: string;
  earnedAt: string;
  notificationSent?: boolean;
  showcased?: boolean;
}

export type CreateBadgeData = Omit<Badge, 'id' | 'createdAt'>;
