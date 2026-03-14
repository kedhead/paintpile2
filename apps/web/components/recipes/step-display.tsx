'use client';

import { useState } from 'react';
import { Clock, Lightbulb, MousePointerClick } from 'lucide-react';
import type { RecordModel } from 'pocketbase';
import type { RecipeStep, RecipeIngredient, RecipeStepAnnotation } from '../../hooks/use-recipes';
import { getFileUrl } from '../../lib/pb-helpers';
import { AnnotationMarker } from '../projects/annotation-marker';
import type { PhotoAnnotation } from '../../hooks/use-photos';
import { VideoEmbed } from './video-embed';
import { StepAnnotationModal } from './step-annotations';

interface StepDisplayProps {
  step: RecipeStep;
  index: number;
  ingredients: RecipeIngredient[];
  media: RecordModel[];
  isOwner: boolean;
  onAnnotationsChange?: (annotations: RecipeStepAnnotation[]) => void;
}

function toPhotoAnnotation(a: RecipeStepAnnotation): PhotoAnnotation {
  return { id: a.id, x: a.x, y: a.y, label: a.label, notes: a.notes };
}

export function StepDisplay({
  step,
  index,
  ingredients,
  media,
  isOwner,
  onAnnotationsChange,
}: StepDisplayProps) {
  const [annotatingMedia, setAnnotatingMedia] = useState<RecordModel | null>(null);
  const stepAnnotations = step.annotations || [];

  const handleAnnotationsSave = (updated: RecipeStepAnnotation[]) => {
    if (onAnnotationsChange) {
      // Merge: replace annotations for this media, keep others
      const mediaId = annotatingMedia?.id;
      const other = stepAnnotations.filter((a) => a.media_id !== mediaId);
      onAnnotationsChange([...other, ...updated]);
    }
    setAnnotatingMedia(null);
  };

  return (
    <li className="rounded-lg border border-border bg-muted/50 p-4">
      <div className="flex gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {index + 1}
        </span>
        <div className="flex-1 space-y-3">
          {/* Title */}
          {step.title && (
            <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
          )}

          {/* Instruction */}
          <p className="whitespace-pre-wrap text-sm text-foreground">{step.instruction}</p>

          {/* Step images with annotations */}
          {media.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {media.map((m) => {
                const mediaAnnotations = stepAnnotations.filter((a) => a.media_id === m.id);
                return (
                  <div key={m.id} className="group relative">
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={getFileUrl(m, m.image, '600x400')}
                        alt={m.caption || 'Step image'}
                        className="h-40 w-auto rounded-lg object-cover sm:h-52"
                      />
                      {/* Render annotation markers on image */}
                      {mediaAnnotations.map((ann) => (
                        <AnnotationMarker
                          key={ann.id}
                          annotation={toPhotoAnnotation(ann)}
                        />
                      ))}
                    </div>
                    {m.caption && (
                      <p className="mt-1 text-xs text-muted-foreground">{m.caption}</p>
                    )}
                    {/* Annotate button for owner */}
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => setAnnotatingMedia(m)}
                        className="absolute bottom-1 right-1 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <MousePointerClick className="h-3 w-3" />
                        Annotate
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Video embed */}
          {step.video_url && <VideoEmbed url={step.video_url} />}

          {/* Technique badge */}
          {step.technique && (
            <span className="inline-block rounded-full border border-primary bg-primary/20 px-2 py-0.5 text-xs font-medium capitalize text-primary">
              {step.technique}
            </span>
          )}

          {/* Paint swatches */}
          {step.paint_indices && step.paint_indices.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {step.paint_indices.map((idx) => {
                const ing = ingredients[idx];
                if (!ing) return null;
                return (
                  <span
                    key={idx}
                    className="flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-border"
                      style={{ backgroundColor: ing.paint_color }}
                    />
                    {ing.paint_name}
                  </span>
                );
              })}
            </div>
          )}

          {/* Tips callout */}
          {step.tips && step.tips.length > 0 && (
            <div className="flex gap-2 rounded-md border border-yellow-500/20 bg-yellow-900/10 px-3 py-2">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-400" />
              <div className="space-y-1">
                {step.tips.map((tip, ti) => (
                  <p key={ti} className="text-xs text-yellow-300">
                    {tip}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Time */}
          {step.estimated_time > 0 && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              ~{step.estimated_time} min
            </p>
          )}
        </div>
      </div>

      {/* Annotation modal */}
      {annotatingMedia && (
        <StepAnnotationModal
          media={annotatingMedia}
          annotations={stepAnnotations.filter((a) => a.media_id === annotatingMedia.id)}
          onSave={handleAnnotationsSave}
          onClose={() => setAnnotatingMedia(null)}
        />
      )}
    </li>
  );
}
