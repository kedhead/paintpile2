export interface Army {
  armyId: string;
  userId: string;
  name: string;
  description?: string;
  projectIds: string[];
  tags: string[];
  faction?: string;
  armySize?: number;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  featuredPhotoId?: string;
  customPhotoUrl?: string;
  likeCount: number;
  commentCount: number;
}

export interface ArmyMember {
  memberId: string;
  projectId: string;
  addedAt: string;
  role?: string;
  notes?: string;
}

export interface ArmyFormData {
  name: string;
  description?: string;
  faction?: string;
  tags?: string[];
  customPhotoUrl?: string;
}

export type GalleryItemType = 'project' | 'army';

export const POPULAR_FACTIONS = [
  'Space Marines',
  'Chaos Space Marines',
  'Orks',
  'Aeldari / Eldar',
  'Necrons',
  'Tyranids',
  'Imperial Guard / Astra Militarum',
  "T'au Empire",
  'Death Guard',
  'Thousand Sons',
  'Other / Custom',
] as const;
