export interface Post {
  postId: string;
  userId: string;
  content: string;
  tags: string[];
  images: PostImage[];
  likeCount: number;
  commentCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  sortOrder: number;
}

export interface PostFormData {
  content: string;
  tags?: string[];
  isPublic?: boolean;
}
