'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { RecordModel } from 'pocketbase';
import { ArrowLeft, Edit2, Trash2, Clock, ChefHat } from 'lucide-react';
import { useAuth } from '../auth-provider';
import { useDeleteRecipe } from '../../hooks/use-recipes';
import { RecipeForm } from './recipe-form';

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner: 'bg-green-900/300/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-900/300/20 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-red-900/300/20 text-red-400 border-red-500/30',
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
  const isOwner = user?.id === recipe.user;
  const [showEdit, setShowEdit] = useState(false);

  const ingredients = parseJSON<{ paint_name: string; paint_color: string; role: string }[]>(
    recipe.ingredients,
    []
  );
  const steps = parseJSON<{ instruction: string; estimated_time: number }[]>(recipe.steps, []);
  const techniques = parseJSON<string[]>(recipe.techniques, []);
  const difficulty = recipe.difficulty || 'beginner';
  const totalTime = steps.reduce((sum, s) => sum + (s.estimated_time || 0), 0);

  const handleDelete = async () => {
    if (!confirm('Delete this recipe? This cannot be undone.')) return;
    await deleteRecipe.mutateAsync(recipe.id);
    router.push('/recipes');
  };

  return (
    <div className="space-y-6">
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
              by {recipe.expand.user.name || recipe.expand.user.username}
            </p>
          )}
        </div>
        {isOwner && (
          <div className="flex gap-1">
            <button
              onClick={() => setShowEdit(true)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg p-2 text-muted-foreground hover:bg-red-900/300/10 hover:text-red-400"
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
                <span className="flex-1 text-sm text-foreground">{ing.paint_name}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground capitalize">
                  {ing.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Steps */}
      {steps.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Steps</h2>
          <ol className="space-y-3">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3 rounded-lg border border-border bg-muted/50 p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{step.instruction}</p>
                  {step.estimated_time > 0 && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      ~{step.estimated_time} min
                    </p>
                  )}
                </div>
              </li>
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

      {showEdit && <RecipeForm onClose={() => setShowEdit(false)} recipe={recipe} />}
    </div>
  );
}
