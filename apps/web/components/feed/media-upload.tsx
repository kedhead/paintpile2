'use client';

import { useCallback, useRef, useState } from 'react';
import { ImagePlus, Film, X, Play } from 'lucide-react';
import Image from 'next/image';

export interface MediaFile {
  file: File;
  type: 'image' | 'video';
  previewUrl: string;
  duration?: number;
}

interface MediaUploadProps {
  files: MediaFile[];
  onChange: (files: MediaFile[]) => void;
  maxImages?: number;
  maxVideos?: number;
  onOverlayClick?: (index: number) => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      resolve(video.duration);
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () => resolve(0);
    video.src = URL.createObjectURL(file);
  });
}

export function MediaUpload({
  files,
  onChange,
  maxImages = 10,
  maxVideos = 3,
  onOverlayClick,
}: MediaUploadProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const imageCount = files.filter((f) => f.type === 'image').length;
  const videoCount = files.filter((f) => f.type === 'video').length;

  const handleFiles = useCallback(
    async (newFiles: FileList | null) => {
      if (!newFiles) return;
      const incoming: MediaFile[] = [];

      for (const file of Array.from(newFiles)) {
        if (file.type.startsWith('image/') && imageCount + incoming.filter((f) => f.type === 'image').length < maxImages) {
          incoming.push({
            file,
            type: 'image',
            previewUrl: URL.createObjectURL(file),
          });
        } else if (file.type.startsWith('video/') && videoCount + incoming.filter((f) => f.type === 'video').length < maxVideos) {
          const duration = await getVideoDuration(file);
          incoming.push({
            file,
            type: 'video',
            previewUrl: URL.createObjectURL(file),
            duration,
          });
        }
      }

      onChange([...files, ...incoming]);
    },
    [files, onChange, imageCount, videoCount, maxImages, maxVideos]
  );

  const removeFile = (index: number) => {
    const removed = files[index];
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    onChange(files.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div className="space-y-2">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((media, i) => (
            <div key={i} className="group relative h-20 w-20">
              {media.type === 'image' ? (
                <>
                  <Image
                    src={media.previewUrl}
                    alt={`Upload ${i + 1}`}
                    fill
                    className="rounded-md object-cover"
                  />
                  {onOverlayClick && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onOverlayClick(i); }}
                      className="absolute bottom-0.5 left-0.5 rounded bg-black/60 px-1 py-0.5 text-[10px] font-medium text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                      title="Add text overlay"
                    >
                      Aa
                    </button>
                  )}
                </>
              ) : (
                <div className="relative flex h-full w-full items-center justify-center rounded-md bg-muted">
                  <video
                    src={media.previewUrl}
                    className="h-full w-full rounded-md object-cover"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="h-6 w-6 fill-white text-white drop-shadow-lg" />
                  </div>
                  {media.duration != null && media.duration > 0 && (
                    <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 py-0.5 text-[10px] font-medium text-white">
                      {formatDuration(media.duration)}
                    </span>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute -right-1 -top-1 rounded-full bg-red-600 p-0.5 text-white opacity-0 shadow transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm transition-colors ${
          dragOver
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
        }`}
      >
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded px-2 py-1 transition-colors hover:bg-muted"
          disabled={imageCount >= maxImages}
        >
          <ImagePlus className="h-4 w-4" />
          <span>Photo ({imageCount}/{maxImages})</span>
        </button>

        <div className="h-4 w-px bg-border" />

        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded px-2 py-1 transition-colors hover:bg-muted"
          disabled={videoCount >= maxVideos}
        >
          <Film className="h-4 w-4" />
          <span>Video ({videoCount}/{maxVideos})</span>
        </button>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}
