'use client';

import { useState } from 'react';

interface PhotoViewerProps {
  photos: { id: string; full: string; thumb: string }[];
  alt: string;
}

/** Big hero photo with a thumbnail strip — the photo is the page. */
export function PhotoViewer({ photos, alt }: PhotoViewerProps) {
  const [index, setIndex] = useState(0);
  const current = photos[index];
  if (!current) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center overflow-hidden rounded-2xl bg-black/40 lg:min-h-[70vh]">
        <img src={current.full} alt={alt} className="max-h-[80vh] w-full object-contain" />
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setIndex(i)}
              aria-label={`Photo ${i + 1}`}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-opacity ${
                i === index ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={photo.thumb} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
