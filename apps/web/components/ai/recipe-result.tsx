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
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{recipe.name}</h3>
        <p className="mt-0.5 text-xs text-gray-500">{recipe.description}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {recipe.difficulty && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{recipe.difficulty}</span>
          )}
          {recipe.category && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{recipe.category}</span>
          )}
          {recipe.estimatedTime && (
            <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              <Clock className="h-3 w-3" />
              {recipe.estimatedTime}min
            </span>
          )}
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-700">Paints Needed</h4>
        <div className="grid grid-cols-2 gap-2">
          {recipe.ingredients.map((ing, i) => (
            <div key={i} className="flex items-center gap-2 rounded-md border border-gray-100 p-2">
              <div
                className="h-4 w-4 rounded border border-gray-200"
                style={{ backgroundColor: ing.hexColor }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-gray-900">{ing.colorName}</p>
                <p className="text-xs text-gray-400">{ing.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-700">Steps</h4>
        <div className="space-y-3">
          {recipe.steps.map((step) => (
            <div key={step.stepNumber} className="flex gap-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                {step.stepNumber}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{step.title}</p>
                <p className="mt-0.5 text-xs text-gray-600">{step.instruction}</p>
                {step.technique && (
                  <p className="mt-0.5 text-xs text-gray-400">Technique: {step.technique}</p>
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
