'use client';

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { RecordModel } from 'pocketbase';
import type { RecipeData, RecipeIngredient, RecipeStep } from '../../hooks/use-recipes';
import { useCreateRecipe, useUpdateRecipe } from '../../hooks/use-recipes';

const CATEGORIES = [
  'skin-tone',
  'metallic',
  'fabric',
  'leather',
  'armor',
  'weapon',
  'wood',
  'stone',
  'nmm',
  'osl',
  'weathering',
  'glow-effect',
  'gem',
  'base-terrain',
] as const;

const INGREDIENT_ROLES = [
  'base',
  'highlight',
  'shadow',
  'midtone',
  'glaze',
  'wash',
  'layer',
  'accent',
] as const;

const TECHNIQUES = [
  'nmm',
  'osl',
  'drybrushing',
  'layering',
  'glazing',
  'washing',
  'blending',
  'feathering',
  'stippling',
  'wetblending',
  'zenithal',
  'airbrushing',
  'freehand',
  'weathering',
] as const;

interface RecipeFormProps {
  onClose: () => void;
  recipe?: RecordModel;
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

export function RecipeForm({ onClose, recipe }: RecipeFormProps) {
  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe();
  const isEditing = !!recipe;

  // Basic fields
  const [name, setName] = useState(recipe?.name || '');
  const [description, setDescription] = useState(recipe?.description || '');
  const [category, setCategory] = useState(recipe?.category || '');
  const [difficulty, setDifficulty] = useState<string>(recipe?.difficulty || 'beginner');
  const [isPublic, setIsPublic] = useState(recipe?.is_public ?? true);

  // Ingredients
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    parseJSON<RecipeIngredient[]>(recipe?.ingredients, [])
  );

  // Steps
  const [steps, setSteps] = useState<RecipeStep[]>(
    parseJSON<RecipeStep[]>(recipe?.steps, [])
  );

  // Techniques
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>(
    parseJSON<string[]>(recipe?.techniques, [])
  );

  const addIngredient = () => {
    setIngredients([...ingredients, { paint_name: '', paint_color: '#888888', role: 'base' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addStep = () => {
    setSteps([...steps, { instruction: '', estimated_time: 5 }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, field: keyof RecipeStep, value: string | number) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const toggleTechnique = (tech: string) => {
    setSelectedTechniques((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data: RecipeData = {
      name: name.trim(),
      description: description.trim() || undefined,
      category: category || undefined,
      difficulty: difficulty as RecipeData['difficulty'],
      ingredients,
      steps,
      techniques: selectedTechniques,
      is_public: isPublic,
    };

    if (isEditing) {
      await updateRecipe.mutateAsync({ recipeId: recipe!.id, data });
    } else {
      await createRecipe.mutateAsync(data);
    }
    onClose();
  };

  const isPending = createRecipe.isPending || updateRecipe.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {isEditing ? 'Edit Recipe' : 'New Recipe'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Section */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-foreground">Basic Info</legend>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Crimson Fist Power Armor"
                maxLength={200}
                required
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the recipe..."
                maxLength={1000}
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">Select...</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(/-/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </fieldset>

          {/* Ingredients Section */}
          <fieldset className="space-y-3">
            <div className="flex items-center justify-between">
              <legend className="text-sm font-medium text-foreground">Ingredients</legend>
              <button
                type="button"
                onClick={addIngredient}
                className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>

            {ingredients.map((ing, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-2">
                <input
                  type="color"
                  value={ing.paint_color}
                  onChange={(e) => updateIngredient(i, 'paint_color', e.target.value)}
                  className="mt-1 h-7 w-7 shrink-0 cursor-pointer rounded border border-border"
                />
                <div className="flex-1 space-y-1.5">
                  <input
                    type="text"
                    value={ing.paint_name}
                    onChange={(e) => updateIngredient(i, 'paint_name', e.target.value)}
                    placeholder="Paint name"
                    className="w-full rounded border border-border bg-card px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <select
                    value={ing.role}
                    onChange={(e) => updateIngredient(i, 'role', e.target.value)}
                    className="w-full rounded border border-border bg-card px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    {INGREDIENT_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeIngredient(i)}
                  className="mt-1 shrink-0 text-muted-foreground hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </fieldset>

          {/* Steps Section */}
          <fieldset className="space-y-3">
            <div className="flex items-center justify-between">
              <legend className="text-sm font-medium text-foreground">Steps</legend>
              <button
                type="button"
                onClick={addStep}
                className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>

            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-2">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div className="flex-1 space-y-1.5">
                  <textarea
                    value={step.instruction}
                    onChange={(e) => updateStep(i, 'instruction', e.target.value)}
                    placeholder="Describe this step..."
                    rows={2}
                    className="w-full resize-none rounded border border-border bg-card px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={step.estimated_time}
                      onChange={(e) => updateStep(i, 'estimated_time', parseInt(e.target.value) || 0)}
                      min={0}
                      className="w-16 rounded border border-border bg-card px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                    <span className="text-xs text-muted-foreground">min</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeStep(i)}
                  className="mt-1 shrink-0 text-muted-foreground hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </fieldset>

          {/* Techniques Section */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-foreground">Techniques</legend>
            <div className="flex flex-wrap gap-1.5">
              {TECHNIQUES.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => toggleTechnique(tech)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                    selectedTechniques.includes(tech)
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-border bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Public checkbox */}
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded border-border"
            />
            Public recipe
          </label>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/80 disabled:opacity-50"
            >
              {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
