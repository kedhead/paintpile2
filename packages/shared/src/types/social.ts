export interface Follow {
  followId: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export type LikeType = 'project' | 'army' | 'recipe' | 'post' | 'message';

export interface Like {
  likeId: string;
  userId: string;
  targetId: string;
  targetType: LikeType;
  createdAt: string;
}

export interface Comment {
  commentId: string;
  targetId: string;
  targetType: 'project' | 'army' | 'recipe' | 'post';
  userId: string;
  username: string;
  userPhotoURL?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  edited: boolean;
}
