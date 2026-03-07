export const queryKeys = {
  posts: {
    all: ['posts'] as const,
    discover: () => [...queryKeys.posts.all, 'discover'] as const,
    following: () => [...queryKeys.posts.all, 'following'] as const,
    byUser: (userId: string) => [...queryKeys.posts.all, 'user', userId] as const,
    detail: (postId: string) => [...queryKeys.posts.all, 'detail', postId] as const,
  },
  likes: {
    all: ['likes'] as const,
    check: (targetId: string, userId: string) => [...queryKeys.likes.all, targetId, userId] as const,
  },
  comments: {
    all: ['comments'] as const,
    byTarget: (targetId: string) => [...queryKeys.comments.all, targetId] as const,
  },
  follows: {
    all: ['follows'] as const,
    check: (followerId: string, followingId: string) =>
      [...queryKeys.follows.all, 'check', followerId, followingId] as const,
    followers: (userId: string) => [...queryKeys.follows.all, 'followers', userId] as const,
    following: (userId: string) => [...queryKeys.follows.all, 'following', userId] as const,
    followingIds: (userId: string) => [...queryKeys.follows.all, 'followingIds', userId] as const,
  },
  users: {
    all: ['users'] as const,
    profile: (userId: string) => [...queryKeys.users.all, 'profile', userId] as const,
    stats: (userId: string) => [...queryKeys.users.all, 'stats', userId] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: () => [...queryKeys.notifications.all, 'list'] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unread'] as const,
  },
  groups: {
    all: ['groups'] as const,
    my: () => [...queryKeys.groups.all, 'my'] as const,
    public: () => [...queryKeys.groups.all, 'public'] as const,
    detail: (groupId: string) => [...queryKeys.groups.all, 'detail', groupId] as const,
    members: (groupId: string) => [...queryKeys.groups.all, 'members', groupId] as const,
    channels: (groupId: string) => [...queryKeys.groups.all, 'channels', groupId] as const,
    invites: (groupId: string) => [...queryKeys.groups.all, 'invites', groupId] as const,
    inviteByCode: (code: string) => [...queryKeys.groups.all, 'invite', code] as const,
  },
  groupMessages: {
    all: ['groupMessages'] as const,
    byChannel: (channelId: string) => [...queryKeys.groupMessages.all, 'channel', channelId] as const,
  },
};
