'use client';

import { useState, useCallback } from 'react';
import type { RecordModel } from 'pocketbase';
import { X, Save, Loader2 } from 'lucide-react';
import { getFileUrl } from '../../lib/pb-helpers';
import { useUpdatePhotoAnnotations, type PhotoAnnotation } from '../../hooks/use-photos';
import { AnnotationMarker } from './annotation-marker';
import { AnnotationPanel } from './annotation-panel';

interface AnnotationModalProps {
  photo: RecordModel;
  projectId: string;
  onClose: () => void;
}

export function AnnotationModal({ photo, projectId, onClose }: AnnotationModalProps) {
  const existing: PhotoAnnotation[] = photo.annotations
    ? (typeof photo.annotations === 'string' ? JSON.parse(photo.annotations) : photo.annotations)
    : [];

  const [annotations, setAnnotations] = useState<PhotoAnnotation[]>(existing);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const updateAnnotations = useUpdatePhotoAnnotations();

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLImageElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const newAnnotation: PhotoAnnotation = {
        id: `ann_${Date.now()}`,
        x,
        y,
        label: `Point ${annotations.length + 1}`,
      };
      setAnnotations([...annotations, newAnnotation]);
      setSelectedId(newAnnotation.id);
    },
    [annotations]
  );

  const handleUpdate = (updated: PhotoAnnotation) => {
    setAnnotations(annotations.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleDelete = (id: string) => {
    setAnnotations(annotations.filter((a) => a.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleSave = async () => {
    await updateAnnotations.mutateAsync({
      photoId: photo.id,
      projectId,
      annotations,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-black/90">
      {/* Close */}
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
            src={getFileUrl(photo, photo.image)}
            alt={photo.caption || 'Photo'}
            className="max-h-[85vh] max-w-[70vw] cursor-crosshair rounded-lg object-contain"
            onClick={handleImageClick}
          />
          {annotations.map((ann) => (
            <AnnotationMarker
              key={ann.id}
              annotation={ann}
              selected={ann.id === selectedId}
              onClick={() => setSelectedId(ann.id)}
            />
          ))}
        </div>
      </div>

      {/* Side panel */}
      <div className="flex w-80 flex-col bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="font-semibold text-foreground">Annotations</h3>
          <button
            onClick={handleSave}
            disabled={updateAnnotations.isPending}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
          >
            {updateAnnotations.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Click on the image to place annotation markers. Drag markers to reposition.
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
                  annotation={ann}
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
