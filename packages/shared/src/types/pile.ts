export type PileStatus = 'unpainted' | 'painting' | 'painted';
export type PileType = 'warhammer' | 'd&d' | 'historical' | 'board-game' | 'other';

export interface PileItem {
  pileId: string;
  userId: string;
  name: string;
  type: PileType;
  quantity: number;
  status: PileStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  projectId?: string;
}

export interface PileFormData {
  name: string;
  type: PileType;
  quantity: number;
  status: PileStatus;
  notes?: string;
}
