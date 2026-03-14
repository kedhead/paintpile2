'use client';

import { useState, useCallback } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import type { RecordModel } from 'pocketbase';
import type { RecipeStepAnnotation } from '../../hooks/use-recipes';
import { getFileUrl } from '../../lib/pb-helpers';
import { AnnotationMarker } from '../projects/annotation-marker';
import { AnnotationPanel } from '../projects/annotation-panel';
import type { PhotoAnnotation } from '../../hooks/use-photos';

interface StepAnnotationModalProps {
  media: RecordModel;
  annotations: RecipeStepAnnotation[];
  onSave: (annotations: RecipeStepAnnotation[]) => void;
  onClose: () => void;
}

// Bridge between RecipeStepAnnotation and PhotoAnnotation for reusing marker/panel components
function toPhotoAnnotation(a: RecipeStepAnnotation): PhotoAnnotation {
  return { id: a.id, x: a.x, y: a.y, label: a.label, notes: a.notes };
}

function toStepAnnotation(a: PhotoAnnotation, mediaId: string): RecipeStepAnnotation {
  return { media_id: mediaId, id: a.id, x: a.x, y: a.y, label: a.label, notes: a.notes };
}

export function StepAnnotationModal({ media, annotations: initial, onSave, onClose }: StepAnnotationModalProps) {
  const [annotations, setAnnotations] = useState<RecipeStepAnnotation[]>(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLImageElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const newAnnotation: RecipeStepAnnotation = {
        media_id: media.id,
        id: `ann_${Date.now()}`,
        x,
        y,
        label: `Point ${annotations.length + 1}`,
      };
      setAnnotations([...annotations, newAnnotation]);
      setSelectedId(newAnnotation.id);
    },
    [annotations, media.id]
  );

  const handleUpdate = (updated: PhotoAnnotation) => {
    setAnnotations(
      annotations.map((a) => (a.id === updated.id ? toStepAnnotation(updated, media.id) : a))
    );
  };

  const handleDelete = (id: string) => {
    setAnnotations(annotations.filter((a) => a.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleSaveClick = () => {
    onSave(annotations);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-black/90">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Image area */}
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="relative max-h-[85vh] max-w-[70vw]">
          <img
            src={getFileUrl(media, media.image)}
            alt={media.caption || 'Step image'}
            className="max-h-[85vh] max-w-[70vw] cursor-crosshair rounded-lg object-contain"
            onClick={handleImageClick}
          />
          {annotations.map((ann) => (
            <AnnotationMarker
              key={ann.id}
              annotation={toPhotoAnnotation(ann)}
              selected={ann.id === selectedId}
              onClick={() => setSelectedId(ann.id)}
            />
          ))}
        </div>
      </div>

      {/* Side panel */}
      <div className="flex w-80 flex-col bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="font-semibold text-foreground">Step Annotations</h3>
          <button
            onClick={handleSaveClick}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/80"
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Click on the image to place annotation markers.
          </p>

          {annotations.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Click on the image to add annotations
            </p>
          ) : (
            annotations.map((ann) => (
              <div
                key={ann.id}
                className={`${ann.id === selectedId ? 'ring-2 ring-primary rounded-lg' : ''}`}
                onClick={() => setSelectedId(ann.id)}
              >
                <AnnotationPanel
                  annotation={toPhotoAnnotation(ann)}
                  onChange={handleUpdate}
                  onDelete={() => handleDelete(ann.id)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
