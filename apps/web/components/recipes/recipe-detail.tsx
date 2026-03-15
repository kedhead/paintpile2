'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { RecordModel } from 'pocketbase';
import { ArrowLeft, Edit2, Trash2, Clock } from 'lucide-react';
import { getDisplayName } from '@paintpile/shared';
import { useAuth } from '../auth-provider';
import { useDeleteRecipe, useUpdateRecipe } from '../../hooks/use-recipes';
import type { RecipeStep, RecipeIngredient, RecipeStepAnnotation } from '../../hooks/use-recipes';
import { useRecipeMedia } from '../../hooks/use-recipe-media';
import { getFileUrl } from '../../lib/pb-helpers';
import { StepDisplay } from './step-display';
import { RecipeShareButtons } from './recipe-share-buttons';
import { RecipeVideoGenerator } from './recipe-video-generator';

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner: 'bg-green-900/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-red-900/20 text-red-400 border-red-500/30',
};

function parseJSON<T>(value: unknown, fallback: T): T {
  if (Array.isArray(value)) return value as T;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

interface RecipeDetailProps {
  recipe: RecordModel;
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  const deleteRecipe = useDeleteRecipe();
  const updateRecipe = useUpdateRecipe();
  const isOwner = user?.id === recipe.user;

  const { data: allMedia } = useRecipeMedia(recipe.id);

  const ingredients = parseJSON<RecipeIngredient[]>(recipe.ingredients, []);
  const steps = parseJSON<RecipeStep[]>(recipe.steps, []);
  const techniques = parseJSON<string[]>(recipe.techniques, []);
  const difficulty = recipe.difficulty || 'beginner';
  const totalTime = steps.reduce((sum, s) => sum + (s.estimated_time || 0), 0);
  const coverUrl = recipe.cover_image ? getFileUrl(recipe, recipe.cover_image) : null;

  // Group media by step_id
  const mediaByStep = useMemo(() => {
    const map: Record<string, RecordModel[]> = {};
    (allMedia || []).forEach((m) => {
      const sid = m.step_id;
      if (!map[sid]) map[sid] = [];
      map[sid].push(m);
    });
    return map;
  }, [allMedia]);

  const handleDelete = async () => {
    if (!confirm('Delete this recipe? This cannot be undone.')) return;
    await deleteRecipe.mutateAsync(recipe.id);
    router.push('/recipes');
  };

  const handleStepAnnotationsChange = (stepIndex: number, annotations: RecipeStepAnnotation[]) => {
    const updatedSteps = [...steps];
    updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], annotations };
    updateRecipe.mutate({
      recipeId: recipe.id,
      data: { steps: updatedSteps },
    });
  };

  return (
    <div className="space-y-6">
      {/* Cover image */}
      {coverUrl && (
        <img
          src={coverUrl}
          alt={recipe.name}
          className="w-full max-h-96 rounded-lg object-contain"
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/recipes')}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-foreground">{recipe.name}</h1>
          {recipe.expand?.user && (
            <p className="text-xs text-muted-foreground">
              by {getDisplayName(recipe.expand.user)}
            </p>
          )}
        </div>
        {isOwner && (
          <div className="flex gap-1">
            <Link
              href={`/recipes/${recipe.id}/edit`}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Edit2 className="h-4 w-4" />
            </Link>
            <button
              onClick={handleDelete}
              className="rounded-lg p-2 text-muted-foreground hover:bg-red-900/10 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Difficulty + Category + Time */}
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.beginner}`}
        >
          {difficulty}
        </span>
        {recipe.category && (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground capitalize">
            {recipe.category.replace(/-/g, ' ')}
          </span>
        )}
        {totalTime > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {totalTime} min total
          </span>
        )}
      </div>

      {/* Share buttons */}
      {recipe.is_public && <RecipeShareButtons recipe={recipe} />}

      {/* Video generator (owner only) */}
      {isOwner && steps.length > 0 && <RecipeVideoGenerator recipe={recipe} />}

      {/* Description */}
      {recipe.description && (
        <p className="whitespace-pre-wrap text-sm text-foreground">{recipe.description}</p>
      )}

      {/* Ingredients */}
      {ingredients.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Ingredients</h2>
          <div className="space-y-2">
            {ingredients.map((ing, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-3 py-2"
              >
                <span
                  className="h-5 w-5 shrink-0 rounded-full border border-border"
                  style={{ backgroundColor: ing.paint_color }}
                />
                <div className="flex-1">
                  <span className="text-sm text-foreground">{ing.paint_name}</span>
                  {ing.paint_brand && (
                    <span className="ml-1.5 text-xs text-muted-foreground">({ing.paint_brand})</span>
                  )}
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground capitalize">
                  {ing.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Steps — rich display */}
      {steps.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Steps</h2>
          <ol className="space-y-4">
            {steps.map((step, i) => (
              <StepDisplay
                key={step.id || i}
                step={step}
                index={i}
                ingredients={ingredients}
                media={mediaByStep[step.id] || []}
                isOwner={isOwner}
                onAnnotationsChange={(anns) => handleStepAnnotationsChange(i, anns)}
              />
            ))}
          </ol>
        </div>
      )}

      {/* Techniques */}
      {techniques.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Techniques</h2>
          <div className="flex flex-wrap gap-1.5">
            {techniques.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-primary bg-primary/20 px-2.5 py-1 text-xs font-medium capitalize text-primary"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
