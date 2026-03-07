import { Paint } from './paint';

export interface Photo {
  photoId: string;
  userId: string;
  projectId: string;
  url: string;
  thumbnailUrl: string;
  caption?: string;
  paintIds?: string[];
  createdAt: string;
  width: number;
  height: number;
  annotations?: PhotoAnnotation[];
  aiProcessing?: {
    backgroundRemoval?: AIProcessingResult;
    upscaling?: AIProcessingResult;
    enhancement?: AIProcessingResult;
    paintSuggestions?: PaintSuggestionsResult;
  };
}

export interface PhotoAnnotation {
  id: string;
  x: number;
  y: number;
  label: string;
  notes?: string;
  recipeId?: string;
  paints: AnnotationPaint[];
}

export interface AnnotationPaint {
  paintId: string;
  role: 'base' | 'highlight' | 'shadow';
  ratio?: string;
  notes?: string;
}

export interface PhotoUpload {
  file: File;
  preview: string;
  caption?: string;
  paintIds?: string[];
}

export interface AIProcessingResult {
  status: 'processing' | 'completed' | 'failed';
  processedAt: string;
  url?: string;
  error?: string;
  costCredits?: number;
}

export interface PaintSuggestionsResult {
  status: 'processing' | 'completed' | 'failed';
  processedAt: string;
  suggestions?: ColorSuggestion[];
  error?: string;
  costCredits?: number;
}

export interface ColorSuggestion {
  hexColor: string;
  description: string;
  matchedPaints: Paint[];
  confidence: number;
  location?: 'base' | 'highlight' | 'shadow' | 'general';
}
