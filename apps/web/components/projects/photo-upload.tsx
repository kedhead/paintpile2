'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useUploadPhoto } from '../../hooks/use-photos';

interface PhotoUploadProps {
  projectId: string;
}

interface PendingPhoto {
  file: File;
  preview: string;
  caption: string;
}

export function PhotoUpload({ projectId }: PhotoUploadProps) {
  const [pending, setPending] = useState<PendingPhoto[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadPhoto = useUploadPhoto();
  const [uploading, setUploading] = useState(false);

  const addFiles = useCallback((files: FileList | File[]) => {
    const newPhotos: PendingPhoto[] = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        caption: '',
      }));
    setPending((prev) => [...prev, ...newPhotos]);
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

  const updateCaption = (index: number, caption: string) => {
    setPending((prev) => prev.map((p, i) => (i === index ? { ...p, caption } : p)));
  };

  const handleUploadAll = async () => {
    if (pending.length === 0) return;
    setUploading(true);
    try {
      for (const photo of pending) {
        await uploadPhoto.mutateAsync({
          projectId,
          file: photo.file,
          caption: photo.caption || undefined,
        });
      }
      // Clean up previews
      pending.forEach((p) => URL.revokeObjectURL(p.preview));
      setPending([]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-muted-foreground'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              addFiles(e.target.files);
            }
            e.target.value = '';
          }}
        />
        <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Drag photos here or{' '}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-primary hover:underline"
          >
            browse
          </button>
        </p>
      </div>

      {/* Pending photos */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {pending.map((photo, index) => (
              <div key={index} className="relative rounded-lg border border-border bg-card p-2">
                <button
                  onClick={() => removePending(index)}
                  className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
                <img
                  src={photo.preview}
                  alt="Preview"
                  className="aspect-square w-full rounded object-cover"
                />
                <input
                  type="text"
                  placeholder="Caption (optional)"
                  value={photo.caption}
                  onChange={(e) => updateCaption(index, e.target.value)}
                  className="mt-1.5 w-full rounded border border-border bg-background px-2 py-1 text-xs focus:border-primary focus:outline-none"
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleUploadAll}
            disabled={uploading}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </span>
            ) : (
              `Upload ${pending.length} photo${pending.length !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
