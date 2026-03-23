export interface PalettePostPaint {
  id: string;
  name: string;
  brand: string;
  hex_color: string;
  order: number;
}

export interface PalettePostMedia {
  file?: File;
  url?: string;
  type: 'image' | 'video';
  thumbnail?: string;
}

export interface TutorialStep {
  id: string;
  description: string;
  imageFile?: File;
  imageUrl?: string;
  paints: PalettePostPaint[];
}

export interface PalettePostData {
  id?: string;
  title: string;
  paints: PalettePostPaint[];
  media: PalettePostMedia[];
  theme: string;
  background_color: string;
  layout: 'grid' | 'list' | 'swatches' | 'circle';
  caption: string;
  is_public: boolean;
  project?: string;
  // Tutorial/carousel fields:
  mode: 'tutorial' | 'single';
  steps: TutorialStep[];
  attribution: string;
  coverImageFile?: File;
  coverImageUrl?: string;
}
