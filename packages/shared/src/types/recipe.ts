export type PaintRole = string;

export type RecipeCategory =
  | 'skin-tone'
  | 'metallic'
  | 'fabric'
  | 'leather'
  | 'armor'
  | 'weapon'
  | 'wood'
  | 'stone'
  | 'nmm'
  | 'osl'
  | 'weathering'
  | 'glow-effect'
  | 'gem'
  | 'base-terrain'
  | 'other';

export type TechniqueCategory =
  | 'nmm'
  | 'osl'
  | 'drybrushing'
  | 'layering'
  | 'glazing'
  | 'washing'
  | 'blending'
  | 'feathering'
  | 'stippling'
  | 'wetblending'
  | 'zenithal'
  | 'airbrushing'
  | 'freehand'
  | 'weathering'
  | 'other';

export type RecipeDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type SurfaceType =
  | 'armor'
  | 'skin'
  | 'fabric'
  | 'leather'
  | 'metal'
  | 'wood'
  | 'stone'
  | 'gem'
  | 'other';

export interface RecipeIngredient {
  paintId: string;
  role: PaintRole;
  ratio?: string;
  order: number;
  notes?: string;
}

export interface RecipeStep {
  stepNumber: number;
  title: string;
  instruction: string;
  photoUrl?: string;
  paints?: string[];
  technique?: TechniqueCategory;
  tips?: string[];
  estimatedTime?: number;
}

export interface PaintRecipe {
  recipeId: string;
  userId: string;
  name: string;
  description: string;
  category: RecipeCategory;
  difficulty: RecipeDifficulty;
  ingredients: RecipeIngredient[];
  techniques: TechniqueCategory[];
  steps: RecipeStep[];
  mixingInstructions?: string;
  applicationTips?: string;
  resultPhotos: string[];
  resultColor?: string;
  estimatedTime?: number;
  surfaceType?: SurfaceType;
  tags?: string[];
  isPublic: boolean;
  isGlobal: boolean;
  saves: number;
  usedInProjects: number;
  likes: number;
  generatedByAI?: boolean;
  sourcePhotoUrl?: string;
  aiGenerationMetadata?: {
    model: string;
    confidence: number;
    creditsUsed: number;
    generatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SavedRecipe {
  saveId: string;
  userId: string;
  recipeId: string;
  savedAt: string;
}

export interface RecipeFormData {
  name: string;
  description: string;
  category: RecipeCategory;
  difficulty: RecipeDifficulty;
  ingredients: RecipeIngredient[];
  techniques: TechniqueCategory[];
  steps: RecipeStep[];
  mixingInstructions?: string;
  applicationTips?: string;
  resultColor?: string;
  estimatedTime?: number;
  surfaceType?: SurfaceType;
  tags?: string[];
  isPublic: boolean;
  isGlobal: boolean;
}

export interface RecipeSearchParams {
  query?: string;
  category?: RecipeCategory;
  difficulty?: RecipeDifficulty;
  techniques?: TechniqueCategory[];
  surfaceType?: SurfaceType;
  userId?: string;
  tags?: string[];
  minLikes?: number;
  sortBy?: 'recent' | 'popular' | 'saves';
}

export const RECIPE_CATEGORY_LABELS: Record<RecipeCategory, string> = {
  'skin-tone': 'Skin Tone',
  'metallic': 'Metallic',
  'fabric': 'Fabric/Cloth',
  'leather': 'Leather',
  'armor': 'Armor',
  'weapon': 'Weapon',
  'wood': 'Wood',
  'stone': 'Stone',
  'nmm': 'Non-Metallic Metal',
  'osl': 'Object Source Lighting',
  'weathering': 'Weathering',
  'glow-effect': 'Glow Effect',
  'gem': 'Gem/Crystal',
  'base-terrain': 'Base/Terrain',
  'other': 'Other',
};

export const TECHNIQUE_LABELS: Record<TechniqueCategory, string> = {
  nmm: 'Non-Metallic Metal',
  osl: 'Object Source Lighting',
  drybrushing: 'Drybrushing',
  layering: 'Layering',
  glazing: 'Glazing',
  washing: 'Washing',
  blending: 'Blending',
  feathering: 'Feathering',
  stippling: 'Stippling',
  wetblending: 'Wet Blending',
  zenithal: 'Zenithal Priming',
  airbrushing: 'Airbrushing',
  freehand: 'Freehand',
  weathering: 'Weathering',
  other: 'Other',
};

export const DIFFICULTY_LABELS: Record<RecipeDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const SURFACE_TYPE_LABELS: Record<SurfaceType, string> = {
  armor: 'Armor',
  skin: 'Skin',
  fabric: 'Fabric/Cloth',
  leather: 'Leather',
  metal: 'Metal',
  wood: 'Wood',
  stone: 'Stone',
  gem: 'Gem/Crystal',
  other: 'Other',
};

export const PAINT_ROLE_LABELS: Record<string, string> = {
  base: 'Base Coat',
  highlight: 'Highlight',
  shadow: 'Shadow',
  midtone: 'Midtone',
  glaze: 'Glaze',
  wash: 'Wash',
  layer: 'Layer',
  accent: 'Accent',
};
