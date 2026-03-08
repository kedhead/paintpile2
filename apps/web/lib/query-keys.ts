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
  projects: {
    all: ['projects'] as const,
    my: () => [...queryKeys.projects.all, 'my'] as const,
    public: () => [...queryKeys.projects.all, 'public'] as const,
    detail: (projectId: string) => [...queryKeys.projects.all, 'detail', projectId] as const,
    byUser: (userId: string) => [...queryKeys.projects.all, 'user', userId] as const,
  },
  aiQuota: {
    all: ['aiQuota'] as const,
    user: (userId: string) => [...queryKeys.aiQuota.all, userId] as const,
  },
  paints: {
    all: ['paints'] as const,
    database: () => [...queryKeys.paints.all, 'database'] as const,
    inventory: () => [...queryKeys.paints.all, 'inventory'] as const,
    custom: () => [...queryKeys.paints.all, 'custom'] as const,
  },
  recipes: {
    all: ['recipes'] as const,
    my: () => [...queryKeys.recipes.all, 'my'] as const,
    public: () => [...queryKeys.recipes.all, 'public'] as const,
    detail: (recipeId: string) => [...queryKeys.recipes.all, 'detail', recipeId] as const,
  },
  armies: {
    all: ['armies'] as const,
    my: () => [...queryKeys.armies.all, 'my'] as const,
    detail: (armyId: string) => [...queryKeys.armies.all, 'detail', armyId] as const,
    members: (armyId: string) => [...queryKeys.armies.all, 'members', armyId] as const,
  },
  pile: {
    all: ['pile'] as const,
    items: () => [...queryKeys.pile.all, 'items'] as const,
    stats: () => [...queryKeys.pile.all, 'stats'] as const,
  },
};
