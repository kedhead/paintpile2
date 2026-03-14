export type NotificationType =
  | 'follow'
  | 'like'
  | 'comment'
  | 'comment_reply'
  | 'mention'
  | 'badge_earned'
  | 'new_post'
  | 'news'
  | 'message'
  | 'system';

export type NotificationTargetType =
  | 'project'
  | 'army'
  | 'recipe'
  | 'comment'
  | 'user'
  | 'badge'
  | 'challenge'
  | 'post'
  | 'channel';

export interface Notification {
  notificationId: string;
  userId: string;
  type: NotificationType;
  actorId: string;
  actorUsername: string;
  actorPhotoURL?: string | null;
  targetId: string;
  targetType: NotificationTargetType;
  targetName?: string | null;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl: string | null;
}

export interface NotificationPreferences {
  inApp: {
    follows: boolean;
    likes: boolean;
    comments: boolean;
    commentReplies: boolean;
    mentions: boolean;
  };
  email: {
    enabled: boolean;
    follows: boolean;
    likes: boolean;
    comments: boolean;
    commentReplies: boolean;
    mentions: boolean;
    digestMode: boolean;
    digestTime: string;
  };
  push: {
    enabled: boolean;
    follows: boolean;
    likes: boolean;
    comments: boolean;
    commentReplies: boolean;
    mentions: boolean;
  };
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  inApp: {
    follows: true,
    likes: true,
    comments: true,
    commentReplies: true,
    mentions: true,
  },
  email: {
    enabled: false,
    follows: false,
    likes: false,
    comments: true,
    commentReplies: true,
    mentions: true,
    digestMode: true,
    digestTime: '09:00',
  },
  push: {
    enabled: false,
    follows: true,
    likes: true,
    comments: true,
    commentReplies: true,
    mentions: true,
  },
};

export type CreateNotificationData = Omit<Notification, 'notificationId' | 'createdAt' | 'read'>;
