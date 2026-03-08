'use client';

import Link from 'next/link';
import type { RecordModel } from 'pocketbase';
import { ChefHat, Layers, Clock } from 'lucide-react';

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner: 'bg-green-900/300/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-900/300/20 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-red-900/300/20 text-red-400 border-red-500/30',
};

interface RecipeCardProps {
  recipe: RecordModel;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const ingredients = parseJSON(recipe.ingredients, []);
  const steps = parseJSON(recipe.steps, []);
  const difficulty = recipe.difficulty || 'beginner';
  const totalTime = steps.reduce(
    (sum: number, s: { estimated_time?: number }) => sum + (s.estimated_time || 0),
    0
  );

  return (
    <Link href={`/recipes/${recipe.id}`}>
      <article className="group overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
        <div className="p-4">
          {/* Header with difficulty badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <ChefHat className="h-4 w-4 shrink-0 text-primary" />
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary line-clamp-1">
                {recipe.name}
              </h3>
            </div>
            <span
              className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.beginner}`}
            >
              {difficulty}
            </span>
          </div>

          {/* Category tag */}
          {recipe.category && (
            <span className="mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground capitalize">
              {recipe.category.replace(/-/g, ' ')}
            </span>
          )}

          {/* Description preview */}
          {recipe.description && (
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
              {recipe.description}
            </p>
          )}

          {/* Stats */}
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <ChefHat className="h-3 w-3" />
              {steps.length} step{steps.length !== 1 ? 's' : ''}
            </span>
            {totalTime > 0 && (
              <span className="ml-auto flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {totalTime}m
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

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
