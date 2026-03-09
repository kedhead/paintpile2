'use client';

import { useState } from 'react';
import type { RecordModel } from 'pocketbase';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { useProjectPhotos } from '../../hooks/use-photos';
import { getFileUrl } from '../../lib/pb-helpers';
import { PhotoLightbox } from './photo-lightbox';
import { AnnotationModal } from './annotation-modal';

interface PhotoGalleryProps {
  projectId: string;
  isOwner: boolean;
}

export function PhotoGallery({ projectId, isOwner }: PhotoGalleryProps) {
  const { data: photos = [], isLoading } = useProjectPhotos(projectId);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [annotatingPhoto, setAnnotatingPhoto] = useState<RecordModel | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background p-8 text-center">
        <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          {isOwner ? 'Upload photos to document your progress' : 'No photos yet'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo: RecordModel, index: number) => {
          const annCount = photo.annotations
            ? (typeof photo.annotations === 'string' ? JSON.parse(photo.annotations || '[]') : photo.annotations).length
            : 0;
          return (
            <button
              key={photo.id}
              onClick={() => setLightboxIndex(index)}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
            >
              <img
                src={getFileUrl(photo, photo.file, '300x300')}
                alt={photo.caption || 'Project photo'}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              {photo.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="line-clamp-1 text-xs text-white">{photo.caption}</p>
                </div>
              )}
              {annCount > 0 && (
                <div className="absolute right-1.5 top-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {annCount}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          projectId={projectId}
          isOwner={isOwner}
          onClose={() => setLightboxIndex(null)}
          onAnnotate={(photo) => {
            setLightboxIndex(null);
            setAnnotatingPhoto(photo);
          }}
        />
      )}

      {annotatingPhoto && (
        <AnnotationModal
          photo={annotatingPhoto}
          projectId={projectId}
          onClose={() => setAnnotatingPhoto(null)}
        />
      )}
    </>
  );
}
