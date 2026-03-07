export type GroupMemberRole = 'admin' | 'moderator' | 'member';
export type GroupChannelType = 'text' | 'voice';

export interface Group {
  groupId: string;
  name: string;
  description?: string;
  icon?: string;
  banner?: string;
  ownerId: string;
  memberCount: number;
  isPublic: boolean;
  inviteCode?: string;
  createdAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  createdAt: string;
}

export interface GroupInvite {
  id: string;
  groupId: string;
  createdById: string;
  code: string;
  maxUses?: number;
  useCount: number;
  expiresAt?: string;
  createdAt: string;
}

export interface GroupChannel {
  id: string;
  groupId: string;
  name: string;
  type: GroupChannelType;
  description?: string;
  sortOrder: number;
  category?: string;
  createdAt: string;
}

export interface GroupMessage {
  messageId: string;
  channelId: string;
  userId: string;
  username: string;
  userPhotoURL?: string;
  content: string;
  imageUrl?: string;
  replyToId?: string;
  createdAt: string;
  updatedAt?: string;
  edited: boolean;
}
