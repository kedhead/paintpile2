'use client';

import { useState, useCallback, useEffect } from 'react';
import type { RecordModel } from 'pocketbase';
import { X, ChevronLeft, ChevronRight, Trash2, PenTool, ImageIcon, Loader2 } from 'lucide-react';
import { useDeletePhoto } from '../../hooks/use-photos';
import { useAuth } from '../auth-provider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/query-keys';
import { getFileUrl, relativeTime } from '../../lib/pb-helpers';
import { AnnotationMarker } from './annotation-marker';
import type { PhotoAnnotation } from '../../hooks/use-photos';

interface PhotoLightboxProps {
  photos: RecordModel[];
  initialIndex: number;
  projectId: string;
  isOwner: boolean;
  onClose: () => void;
  onAnnotate?: (photo: RecordModel) => void;
}

export function PhotoLightbox({
  photos,
  initialIndex,
  projectId,
  isOwner,
  onClose,
  onAnnotate,
}: PhotoLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const deletePhoto = useDeletePhoto();
  const { pb } = useAuth();
  const queryClient = useQueryClient();
  const [showAnnotations, setShowAnnotations] = useState(true);

  const setCover = useMutation({
    mutationFn: async (photoRecord: RecordModel) => {
      const url = getFileUrl(photoRecord, photoRecord.image);
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], photoRecord.image, { type: blob.type });
      const formData = new FormData();
      formData.append('cover_photo', file);
      return pb.collection('projects').update(projectId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });

  const photo = photos[index];
  const annotations: PhotoAnnotation[] = photo?.annotations
    ? (typeof photo.annotations === 'string' ? JSON.parse(photo.annotations) : photo.annotations)
    : [];

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : photos.length - 1));
  }, [photos.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i < photos.length - 1 ? i + 1 : 0));
  }, [photos.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, goPrev, goNext]);

  const handleDelete = async () => {
    if (!confirm('Delete this photo?')) return;
    await deletePhoto.mutateAsync({ photoId: photo.id, projectId });
    if (photos.length <= 1) {
      onClose();
    } else {
      setIndex((i) => Math.min(i, photos.length - 2));
    }
  };

  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Navigation */}
      {photos.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            style={{ top: '50%', transform: 'translateY(-50%)', right: '1rem' }}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Image */}
      <div className="relative max-h-[85vh] max-w-[90vw]">
        <img
          src={getFileUrl(photo, photo.image)}
          alt={photo.caption || 'Project photo'}
          className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
        />

        {/* Annotation dots */}
        {showAnnotations &&
          annotations.map((ann) => (
            <AnnotationMarker key={ann.id} annotation={ann} />
          ))}
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 inset-x-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-6 py-4">
        <div>
          {photo.caption && (
            <p className="text-sm text-white">{photo.caption}</p>
          )}
          <p className="text-xs text-white/60">
            {index + 1} / {photos.length} &middot; {relativeTime(photo.created)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {annotations.length > 0 && (
            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                showAnnotations
                  ? 'bg-primary text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
            </button>
          )}
          {isOwner && (
            <button
              onClick={() => setCover.mutate(photo)}
              disabled={setCover.isPending}
              className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/30 flex items-center gap-1.5"
              title="Set as cover photo"
            >
              {setCover.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ImageIcon className="h-3.5 w-3.5" />
              )}
              {setCover.isSuccess ? 'Cover set!' : 'Set as Cover'}
            </button>
          )}
          {isOwner && onAnnotate && (
            <button
              onClick={() => onAnnotate(photo)}
              className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
              title="Annotate"
            >
              <PenTool className="h-4 w-4" />
            </button>
          )}
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deletePhoto.isPending}
              className="rounded-full bg-white/20 p-2 text-red-400 hover:bg-red-900/50"
              title="Delete photo"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
