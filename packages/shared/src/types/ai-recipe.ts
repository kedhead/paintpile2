import {
  RecipeCategory,
  RecipeDifficulty,
  TechniqueCategory,
  PaintRole,
  SurfaceType,
} from './recipe';
import { Paint } from './paint';

export interface GeneratedIngredient {
  hexColor: string;
  colorName: string;
  role: PaintRole;
  matchedPaints?: Paint[];
  notes?: string;
}

export interface GeneratedStep {
  stepNumber: number;
  title: string;
  instruction: string;
  paints?: string[];
  technique?: TechniqueCategory;
  tips?: string[];
}

export interface GeneratedRecipe {
  name: string;
  description: string;
  category: RecipeCategory;
  difficulty: RecipeDifficulty;
  techniques: TechniqueCategory[];
  surfaceType?: SurfaceType;
  estimatedTime?: number;
  ingredients: GeneratedIngredient[];
  steps: GeneratedStep[];
  mixingInstructions?: string;
  applicationTips?: string;
  confidence: number;
}

export interface GenerateRecipeRequest {
  userId: string;
  imageUrl: string;
  context?: string;
}

export interface GenerateRecipeResponse {
  success: boolean;
  data?: {
    recipe: GeneratedRecipe;
    creditsUsed: number;
  };
  error?: string;
}
