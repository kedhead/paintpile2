export interface Channel {
  channelId: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  sortOrder: number;
  createdAt: string;
}

export interface Message {
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

export interface MessageFormData {
  content: string;
  imageUrl?: string;
  replyToId?: string;
}
