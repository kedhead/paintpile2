export type AIOperation =
  | 'enhancement'
  | 'upscaling'
  | 'paintSuggestions'
  | 'aiCleanup'
  | 'recolor'
  | 'recipeGeneration'
  | 'techniqueAdvisor'
  | 'recipeVideoScript'
  | 'recipeVideoAI';

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
  enhancement: 10,
  upscaling: 10,
  paintSuggestions: 8,
  aiCleanup: 25,
  recolor: 20,
  recipeGeneration: 25,
  techniqueAdvisor: 8,
  recipeVideoScript: 15,
  recipeVideoAI: 50,
} as const;

export function creditsToDollars(credits: number): string {
  return `$${(credits / 1000).toFixed(2)}`;
}

export function dollarsToCredits(dollars: number): number {
  return Math.round(dollars * 1000);
}
