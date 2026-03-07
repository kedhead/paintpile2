export type PaintType = 'base' | 'layer' | 'shade' | 'metallic' | 'technical' | 'contrast';

export interface Paint {
  paintId: string;
  brand: string;
  name: string;
  hexColor: string;
  type: PaintType;
  category?: string;
  swatchUrl?: string;
}

export interface CustomPaint extends Paint {
  userId: string;
  createdAt: string;
}

export interface ProjectPaint {
  paintId: string;
  projectId: string;
  addedAt: string;
  notes?: string;
  usageCount: number;
}

export interface UserOwnedPaint {
  id?: string;
  userId: string;
  paintId: string;
  quantity: number;
  notes?: string;
  acquiredAt: string;
}
