'use client';

import { ChefHat, Clock, Layers } from 'lucide-react';
import type { RecordModel } from 'pocketbase';
import type { RecipeIngredient } from '../../hooks/use-recipes';
import { getFileUrl } from '../../lib/pb-helpers';

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

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: '#4ade80',
  intermediate: '#facc15',
  advanced: '#f87171',
};

interface RecipeShareCardProps {
  recipe: RecordModel;
  cardId: string;
}

export function RecipeShareCard({ recipe, cardId }: RecipeShareCardProps) {
  const ingredients = parseJSON<RecipeIngredient[]>(recipe.ingredients, []);
  const steps = parseJSON<{ estimated_time?: number }[]>(recipe.steps, []);
  const techniques = parseJSON<string[]>(recipe.techniques, []);
  const difficulty = recipe.difficulty || 'beginner';
  const totalTime = steps.reduce((sum, s) => sum + (s.estimated_time || 0), 0);
  const coverUrl = recipe.cover_image
    ? getFileUrl(recipe, recipe.cover_image, '400x300')
    : null;

  return (
    <div
      id={cardId}
      style={{ width: 1200, height: 630 }}
      className="relative flex overflow-hidden bg-[#14111e]"
    >
      {/* Cover image side */}
      {coverUrl && (
        <div className="w-[480px] shrink-0">
          <img
            src={coverUrl}
            alt=""
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
          />
        </div>
      )}

      {/* Content side */}
      <div className="flex flex-1 flex-col justify-between p-10">
        {/* Top: title + difficulty */}
        <div>
          <div className="flex items-center gap-3">
            <ChefHat className="h-8 w-8 text-[#a78bfa]" />
            <span
              className="rounded-full px-3 py-1 text-sm font-bold uppercase"
              style={{
                backgroundColor: `${DIFFICULTY_COLORS[difficulty]}22`,
                color: DIFFICULTY_COLORS[difficulty],
              }}
            >
              {difficulty}
            </span>
          </div>
          <h1 className="mt-4 text-4xl font-bold text-white leading-tight">
            {recipe.name}
          </h1>
          {recipe.category && (
            <p className="mt-2 text-lg text-gray-400 capitalize">
              {recipe.category.replace(/-/g, ' ')}
            </p>
          )}
        </div>

        {/* Middle: ingredient color swatches */}
        {ingredients.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {ingredients.slice(0, 8).map((ing, i) => (
              <div key={i} className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                <span
                  className="h-4 w-4 rounded-full border border-white/20"
                  style={{ backgroundColor: ing.paint_color }}
                />
                <span className="text-sm text-gray-300">{ing.paint_name}</span>
              </div>
            ))}
            {ingredients.length > 8 && (
              <span className="flex items-center rounded-full bg-white/10 px-3 py-1.5 text-sm text-gray-400">
                +{ingredients.length - 8} more
              </span>
            )}
          </div>
        )}

        {/* Bottom: stats + techniques */}
        <div>
          {techniques.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {techniques.slice(0, 5).map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-[#a78bfa]/30 bg-[#a78bfa]/10 px-2.5 py-1 text-xs font-medium capitalize text-[#a78bfa]"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-6 text-gray-400">
            <span className="flex items-center gap-2 text-sm">
              <Layers className="h-4 w-4" />
              {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-2 text-sm">
              <ChefHat className="h-4 w-4" />
              {steps.length} step{steps.length !== 1 ? 's' : ''}
            </span>
            {totalTime > 0 && (
              <span className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                {totalTime} min
              </span>
            )}
          </div>
          <p className="mt-3 text-xs text-gray-500">thepaintpile.com</p>
        </div>
      </div>
    </div>
  );
}
