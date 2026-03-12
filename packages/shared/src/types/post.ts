export interface Post {
  postId: string;
  userId: string;
  content: string;
  tags: string[];
  images: PostImage[];
  videos: PostVideo[];
  textOverlays: TextOverlay[];
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

export interface PostVideo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  sortOrder: number;
}

export interface TextOverlay {
  id: string;
  text: string;
  imageIndex: number;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  strokeColor?: string;
  rotation?: number;
  opacity?: number;
  effect?: 'none' | 'shadow' | 'outline' | 'glow' | 'neon';
}

export interface PostFormData {
  content: string;
  tags?: string[];
  isPublic?: boolean;
  textOverlays?: TextOverlay[];
}
