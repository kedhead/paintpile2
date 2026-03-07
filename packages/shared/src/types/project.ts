export type ProjectStatus = 'not-started' | 'in-progress' | 'completed';

export interface Project {
  projectId: string;
  userId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  quantity?: number;
  tags: string[];
  startDate?: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  photoCount: number;
  paintCount: number;
  featuredPhotoId?: string;
  coverPhotoUrl?: string;
  likeCount: number;
  commentCount: number;
  armyIds?: string[];
  lastCritique?: {
    score: number;
    grade: string;
    analysis: string;
    colors: string;
    technical_strengths: string[];
    improvements: string[];
    createdAt: string;
  };
}

export interface ProjectFormData {
  name: string;
  coverPhotoUrl?: string;
  description?: string;
  status: ProjectStatus;
  quantity?: number;
  tags?: string[];
  startDate?: Date;
}
