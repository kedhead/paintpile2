export type AIOperation =
  | 'enhancement'
  | 'upscaling'
  | 'paintSuggestions'
  | 'aiCleanup'
  | 'recolor'
  | 'recipeGeneration'
  | 'techniqueAdvisor'
  | 'recipeVideoScript'
  | 'recipeVideoAI'
  | 'palettePostCaption';

export interface UsageStats {
  totalCreditsUsed: number;
  currentMonth: {
    credits: number;
    requestCount: number;
    enhancement: number;
    upscaling: number;
    paintSuggestions: number;
    aiCleanup: number;
    recolor: number;
    recipeGeneration: number;
    techniqueAdvisor: number;
    recipeVideoScript: number;
    recipeVideoAI: number;
    palettePostCaption: number;
  };
  quotaLimit: number;
  remainingCredits: number;
  percentageUsed: number;
  resetDate: Date;
}

/**
 * Cost estimates for different operations
 * 1 credit = $0.001
 */
export const OPERATION_COSTS = {
  enhancement: 15,
  upscaling: 20,
  paintSuggestions: 15,
  aiCleanup: 40,
  recolor: 35,
  recipeGeneration: 40,
  techniqueAdvisor: 15,
  recipeVideoScript: 25,
  recipeVideoAI: 80,
  palettePostCaption: 8,
} as const;

export function creditsToDollars(credits: number): string {
  return `$${(credits / 1000).toFixed(2)}`;
}

export function dollarsToCredits(dollars: number): number {
  return Math.round(dollars * 1000);
}
