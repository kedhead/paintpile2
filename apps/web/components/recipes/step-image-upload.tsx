'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import type { RecordModel } from 'pocketbase';
import { useUploadRecipeMedia, useDeleteRecipeMedia } from '../../hooks/use-recipe-media';
import { getFileUrl } from '../../lib/pb-helpers';

interface StepImageUploadProps {
  recipeId: string | null;
  stepId: string;
  existingMedia: RecordModel[];
  onMediaChange?: (mediaIds: string[]) => void;
}

interface PendingImage {
  file: File;
  preview: string;
}

export function StepImageUpload({ recipeId, stepId, existingMedia, onMediaChange }: StepImageUploadProps) {
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const uploadMedia = useUploadRecipeMedia();
  const deleteMedia = useDeleteRecipeMedia();

  const addFiles = useCallback((files: FileList | File[]) => {
    const newImages: PendingImage[] = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
    setPending((prev) => [...prev, ...newImages]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const removePending = (index: number) => {
    setPending((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUploadAll = async () => {
    if (!recipeId || pending.length === 0) return;
    setUploading(true);
    try {
      const newIds: string[] = [];
      for (let i = 0; i < pending.length; i++) {
        const result = await uploadMedia.mutateAsync({
          recipeId,
          stepId,
          file: pending[i].file,
          sortOrder: existingMedia.length + i,
        });
        newIds.push(result.id);
      }
      pending.forEach((p) => URL.revokeObjectURL(p.preview));
      setPending([]);
      if (onMediaChange) {
        onMediaChange([...existingMedia.map((m) => m.id), ...newIds]);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteExisting = async (mediaId: string) => {
    if (!recipeId) return;
    await deleteMedia.mutateAsync({ mediaId, recipeId });
    if (onMediaChange) {
      onMediaChange(existingMedia.filter((m) => m.id !== mediaId).map((m) => m.id));
    }
  };

  return (
    <div className="space-y-2">
      {/* Existing images */}
      {existingMedia.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {existingMedia.map((media) => (
            <div key={media.id} className="relative h-16 w-16 rounded border border-border">
              <img
                src={getFileUrl(media, media.image, '150x150')}
                alt={media.caption || 'Step image'}
                className="h-full w-full rounded object-cover"
              />
              <button
                type="button"
                onClick={() => handleDeleteExisting(media.id)}
                className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`rounded border-2 border-dashed p-3 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-muted-foreground'
        }`}
      >
        <Upload className="mx-auto h-4 w-4 text-muted-foreground" />
        <p className="mt-1 text-xs text-muted-foreground">
          Drop images or{' '}
          <label className="cursor-pointer text-primary hover:underline">
            browse
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
          </label>
        </p>
      </div>

      {/* Pending images */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {pending.map((img, index) => (
              <div key={index} className="relative h-16 w-16 rounded border border-border">
                <img src={img.preview} alt="Preview" className="h-full w-full rounded object-cover" />
                <button
                  type="button"
                  onClick={() => removePending(index)}
                  className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleUploadAll}
            disabled={uploading || !recipeId}
            className="w-full rounded bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/80 disabled:opacity-50"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Uploading...
              </span>
            ) : (
              `Upload ${pending.length} image${pending.length !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
