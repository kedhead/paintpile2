'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import type { RecordModel } from 'pocketbase';
import type { RecipeData, RecipeIngredient, RecipeStep } from '../../hooks/use-recipes';
import { useCreateRecipe, useUpdateRecipe } from '../../hooks/use-recipes';
import { useRecipeMedia } from '../../hooks/use-recipe-media';
import { useAuth } from '../auth-provider';
import { getFileUrl } from '../../lib/pb-helpers';
import { StepEditor } from './step-editor';

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
  'other',
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

function migrateStep(step: Record<string, unknown>, index: number): RecipeStep {
  return {
    id: (step.id as string) || `step_${Date.now()}_${index}`,
    title: (step.title as string) || '',
    instruction: (step.instruction as string) || '',
    estimated_time: (step.estimated_time as number) || 0,
    technique: step.technique as string | undefined,
    paint_indices: step.paint_indices as number[] | undefined,
    tips: step.tips as string[] | undefined,
    video_url: step.video_url as string | undefined,
    media_ids: step.media_ids as string[] | undefined,
    annotations: step.annotations as RecipeStep['annotations'] | undefined,
  };
}

export function RecipeForm({ recipe }: RecipeFormProps) {
  const router = useRouter();
  const { pb } = useAuth();
  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe();
  const isEditing = !!recipe;

  const { data: allMedia } = useRecipeMedia(recipe?.id || null);

  // Basic fields
  const [name, setName] = useState(recipe?.name || '');
  const [description, setDescription] = useState(recipe?.description || '');
  const [category, setCategory] = useState(recipe?.category || '');
  const [difficulty, setDifficulty] = useState<string>(recipe?.difficulty || 'beginner');
  const [isPublic, setIsPublic] = useState(recipe?.is_public ?? true);

  // Cover image
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const existingCover = recipe?.cover_image
    ? getFileUrl(recipe, recipe.cover_image, '400x300')
    : null;

  // Ingredients
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    parseJSON<RecipeIngredient[]>(recipe?.ingredients, [])
  );

  // Steps — migrate old format (no id/title) to new format
  const [steps, setSteps] = useState<RecipeStep[]>(() => {
    const raw = parseJSON<Record<string, unknown>[]>(recipe?.steps, []);
    return raw.map((s, i) => migrateStep(s, i));
  });

  // Techniques
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>(
    parseJSON<string[]>(recipe?.techniques, [])
  );

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
    setSteps([
      ...steps,
      {
        id: `step_${Date.now()}`,
        title: '',
        instruction: '',
        estimated_time: 5,
      },
    ]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, step: RecipeStep) => {
    const updated = [...steps];
    updated[index] = step;
    setSteps(updated);
  };

  const toggleTechnique = (tech: string) => {
    setSelectedTechniques((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
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
      // Update recipe — use FormData if cover image changed
      if (coverFile) {
        const formData = new FormData();
        formData.append('name', data.name);
        if (data.description) formData.append('description', data.description);
        if (data.category) formData.append('category', data.category);
        if (data.difficulty) formData.append('difficulty', data.difficulty);
        formData.append('ingredients', JSON.stringify(data.ingredients || []));
        formData.append('steps', JSON.stringify(data.steps || []));
        formData.append('techniques', JSON.stringify(data.techniques || []));
        formData.append('is_public', String(data.is_public));
        formData.append('cover_image', coverFile);
        await pb.collection('recipes').update(recipe!.id, formData);
      } else {
        await updateRecipe.mutateAsync({ recipeId: recipe!.id, data });
      }
      router.push(`/recipes/${recipe!.id}`);
    } else {
      // Create recipe — use FormData if cover image provided
      if (coverFile) {
        const formData = new FormData();
        formData.append('name', data.name);
        if (data.description) formData.append('description', data.description);
        if (data.category) formData.append('category', data.category);
        if (data.difficulty) formData.append('difficulty', data.difficulty);
        formData.append('ingredients', JSON.stringify(data.ingredients || []));
        formData.append('steps', JSON.stringify(data.steps || []));
        formData.append('techniques', JSON.stringify(data.techniques || []));
        formData.append('is_public', String(data.is_public));
        formData.append('cover_image', coverFile);
        formData.append('user', pb.authStore.record!.id);
        const result = await pb.collection('recipes').create(formData);
        router.push(`/recipes/${result.id}`);
      } else {
        const result = await createRecipe.mutateAsync(data);
        router.push(`/recipes/${result.id}`);
      }
    }
  };

  const isPending = createRecipe.isPending || updateRecipe.isPending;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">
          {isEditing ? 'Edit Recipe' : 'New Recipe'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
          {/* Left column: metadata */}
          <div className="space-y-5">
            {/* Basic Info */}
            <fieldset className="space-y-3 rounded-lg border border-border bg-card p-4">
              <legend className="px-2 text-sm font-medium text-foreground">Basic Info</legend>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Crimson Fist Power Armor"
                  maxLength={200}
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the recipe..."
                  maxLength={1000}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
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
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Cover Image */}
            <fieldset className="space-y-3 rounded-lg border border-border bg-card p-4">
              <legend className="px-2 text-sm font-medium text-foreground">Cover Image</legend>
              {(coverPreview || existingCover) && (
                <img
                  src={coverPreview || existingCover!}
                  alt="Cover preview"
                  className="h-40 w-full rounded-lg object-cover"
                />
              )}
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-sm text-muted-foreground hover:border-muted-foreground">
                <Upload className="h-4 w-4" />
                {coverPreview || existingCover ? 'Change cover image' : 'Upload cover image'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleCoverSelect}
                />
              </label>
            </fieldset>

            {/* Ingredients */}
            <fieldset className="space-y-3 rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <legend className="px-2 text-sm font-medium text-foreground">Ingredients</legend>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>

              {ingredients.map((ing, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-2"
                >
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
                      className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                    <select
                      value={ing.role}
                      onChange={(e) => updateIngredient(i, 'role', e.target.value)}
                      className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
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

            {/* Techniques */}
            <fieldset className="space-y-3 rounded-lg border border-border bg-card p-4">
              <legend className="px-2 text-sm font-medium text-foreground">Techniques</legend>
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
            <label className="flex items-center gap-2 px-1 text-sm text-foreground">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-border"
              />
              Public recipe
            </label>
          </div>

          {/* Right column: steps */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">Steps</h2>
              <button
                type="button"
                onClick={addStep}
                className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3 w-3" /> Add Step
              </button>
            </div>

            {steps.length === 0 && (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No steps yet. Click &quot;Add Step&quot; to start building your tutorial.
                </p>
              </div>
            )}

            {steps.map((step, i) => (
              <StepEditor
                key={step.id}
                step={step}
                index={i}
                ingredients={ingredients}
                recipeId={recipe?.id || null}
                stepMedia={mediaByStep[step.id] || []}
                onChange={(updated) => updateStep(i, updated)}
                onRemove={() => removeStep(i)}
              />
            ))}
          </div>
        </div>

        {/* Actions — full width */}
        <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || isPending}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : isEditing ? (
              'Save Changes'
            ) : (
              'Create Recipe'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
