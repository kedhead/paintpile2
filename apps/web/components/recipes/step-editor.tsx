'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, X, GripVertical } from 'lucide-react';
import type { RecordModel } from 'pocketbase';
import type { RecipeStep, RecipeIngredient } from '../../hooks/use-recipes';
import { StepImageUpload } from './step-image-upload';

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

interface StepEditorProps {
  step: RecipeStep;
  index: number;
  ingredients: RecipeIngredient[];
  recipeId: string | null;
  stepMedia: RecordModel[];
  onChange: (step: RecipeStep) => void;
  onRemove: () => void;
}

export function StepEditor({
  step,
  index,
  ingredients,
  recipeId,
  stepMedia,
  onChange,
  onRemove,
}: StepEditorProps) {
  const [expanded, setExpanded] = useState(true);

  const updateField = <K extends keyof RecipeStep>(field: K, value: RecipeStep[K]) => {
    onChange({ ...step, [field]: value });
  };

  const addTip = () => {
    updateField('tips', [...(step.tips || []), '']);
  };

  const updateTip = (tipIndex: number, value: string) => {
    const tips = [...(step.tips || [])];
    tips[tipIndex] = value;
    updateField('tips', tips);
  };

  const removeTip = (tipIndex: number) => {
    updateField('tips', (step.tips || []).filter((_, i) => i !== tipIndex));
  };

  const togglePaintIndex = (paintIndex: number) => {
    const current = step.paint_indices || [];
    if (current.includes(paintIndex)) {
      updateField('paint_indices', current.filter((i) => i !== paintIndex));
    } else {
      updateField('paint_indices', [...current, paintIndex]);
    }
  };

  const handleMediaChange = (mediaIds: string[]) => {
    updateField('media_ids', mediaIds);
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 p-3 text-left"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {index + 1}
        </span>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="flex-1 truncate text-sm font-medium text-foreground">
          {step.title || `Step ${index + 1}`}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-red-900/10 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="space-y-3 border-t border-border p-3">
          {/* Title */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Title</label>
            <input
              type="text"
              value={step.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g. Base coat application"
              className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Instruction */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Instruction
            </label>
            <textarea
              value={step.instruction}
              onChange={(e) => updateField('instruction', e.target.value)}
              placeholder="Describe what to do in this step..."
              rows={3}
              className="w-full resize-none rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Technique + Time row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Technique
              </label>
              <select
                value={step.technique || ''}
                onChange={(e) => updateField('technique', e.target.value || undefined)}
                className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">None</option>
                {TECHNIQUES.map((tech) => (
                  <option key={tech} value={tech}>
                    {tech}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Time (min)
              </label>
              <input
                type="number"
                value={step.estimated_time}
                onChange={(e) => updateField('estimated_time', parseInt(e.target.value) || 0)}
                min={0}
                className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Paint checkboxes */}
          {ingredients.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Paints used
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ingredients.map((ing, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => togglePaintIndex(i)}
                    className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs transition-colors ${
                      (step.paint_indices || []).includes(i)
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-border bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-border"
                      style={{ backgroundColor: ing.paint_color }}
                    />
                    {ing.paint_name || `Paint ${i + 1}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Video URL */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Video URL (YouTube/Vimeo)
            </label>
            <input
              type="url"
              value={step.video_url || ''}
              onChange={(e) => updateField('video_url', e.target.value || undefined)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Tips */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Tips</label>
              <button
                type="button"
                onClick={addTip}
                className="flex items-center gap-0.5 text-xs text-primary hover:underline"
              >
                <Plus className="h-3 w-3" /> Add tip
              </button>
            </div>
            {(step.tips || []).map((tip, tipIdx) => (
              <div key={tipIdx} className="mb-1 flex items-center gap-1">
                <input
                  type="text"
                  value={tip}
                  onChange={(e) => updateTip(tipIdx, e.target.value)}
                  placeholder="Helpful tip..."
                  className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeTip(tipIdx)}
                  className="shrink-0 text-muted-foreground hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Image upload */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Step Images
            </label>
            <StepImageUpload
              recipeId={recipeId}
              stepId={step.id}
              existingMedia={stepMedia}
              onMediaChange={handleMediaChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
