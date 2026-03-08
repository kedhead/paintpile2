'use client';

import { Clock } from 'lucide-react';

interface Ingredient {
  hexColor: string;
  colorName: string;
  role: string;
  notes?: string;
}

interface Step {
  stepNumber: number;
  title: string;
  instruction: string;
  paints?: string[];
  technique?: string;
  tips?: string[];
}

interface RecipeData {
  name: string;
  description: string;
  category?: string;
  difficulty?: string;
  techniques?: string[];
  estimatedTime?: number;
  ingredients: Ingredient[];
  steps: Step[];
  mixingInstructions?: string;
  applicationTips?: string;
  confidence?: number;
}

interface RecipeResultProps {
  recipe: RecipeData;
}

export function RecipeResult({ recipe }: RecipeResultProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{recipe.name}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{recipe.description}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {recipe.difficulty && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{recipe.difficulty}</span>
          )}
          {recipe.category && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{recipe.category}</span>
          )}
          {recipe.estimatedTime && (
            <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {recipe.estimatedTime}min
            </span>
          )}
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground">Paints Needed</h4>
        <div className="grid grid-cols-2 gap-2">
          {recipe.ingredients.map((ing, i) => (
            <div key={i} className="flex items-center gap-2 rounded-md border border-border p-2">
              <div
                className="h-4 w-4 rounded border border-border"
                style={{ backgroundColor: ing.hexColor }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">{ing.colorName}</p>
                <p className="text-xs text-muted-foreground">{ing.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground">Steps</h4>
        <div className="space-y-3">
          {recipe.steps.map((step) => (
            <div key={step.stepNumber} className="flex gap-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                {step.stepNumber}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{step.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{step.instruction}</p>
                {step.technique && (
                  <p className="mt-0.5 text-xs text-muted-foreground">Technique: {step.technique}</p>
                )}
                {step.tips?.map((tip, i) => (
                  <p key={i} className="mt-0.5 text-xs italic text-blue-600">{tip}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      {recipe.applicationTips && (
        <div className="rounded-md bg-amber-50 p-3">
          <p className="text-xs font-medium text-amber-800">Tips</p>
          <p className="mt-0.5 text-xs text-amber-700">{recipe.applicationTips}</p>
        </div>
      )}
    </div>
  );
}
