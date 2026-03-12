'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { RecordModel } from 'pocketbase';
import { getFileUrl } from '../../lib/pb-helpers';

interface PostImageGridProps {
  post: RecordModel;
}

function ImageLightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
      >
        <X className="h-5 w-5" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i - 1 + images.length) % images.length);
            }}
            className="absolute left-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i + 1) % images.length);
            }}
            className="absolute right-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      <img
        src={images[index]}
        alt="Full size"
        className="max-h-[90vh] max-w-[90vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <div className="absolute bottom-4 text-sm text-white/70">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

export function PostImageGrid({ post }: PostImageGridProps) {
  const imageFiles: string[] = post.images || [];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (imageFiles.length === 0) return null;

  const getThumbUrl = (filename: string) => getFileUrl(post, filename, '600x600');
  const getFullUrl = (filename: string) => getFileUrl(post, filename);
  const fullUrls = imageFiles.map(getFullUrl);

  const openLightbox = (i: number) => setLightboxIndex(i);

  if (imageFiles.length === 1) {
    return (
      <>
        <div
          className="relative mt-3 aspect-[4/3] cursor-pointer overflow-hidden rounded-lg bg-card"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={getThumbUrl(imageFiles[0])}
            alt="Post image"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 600px"
          />
        </div>
        {lightboxIndex !== null && (
          <ImageLightbox images={fullUrls} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
        )}
      </>
    );
  }

  if (imageFiles.length === 2) {
    return (
      <>
        <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-lg">
          {imageFiles.map((file, i) => (
            <div key={i} className="relative aspect-square cursor-pointer bg-card" onClick={() => openLightbox(i)}>
              <Image src={getThumbUrl(file)} alt={`Image ${i + 1}`} fill className="object-cover" sizes="300px" />
            </div>
          ))}
        </div>
        {lightboxIndex !== null && (
          <ImageLightbox images={fullUrls} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
        )}
      </>
    );
  }

  if (imageFiles.length === 3) {
    return (
      <>
        <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-lg">
          <div className="relative row-span-2 aspect-[2/3] cursor-pointer bg-card" onClick={() => openLightbox(0)}>
            <Image src={getThumbUrl(imageFiles[0])} alt="Image 1" fill className="object-cover" sizes="300px" />
          </div>
          {imageFiles.slice(1).map((file, i) => (
            <div key={i} className="relative aspect-square cursor-pointer bg-card" onClick={() => openLightbox(i + 1)}>
              <Image src={getThumbUrl(file)} alt={`Image ${i + 2}`} fill className="object-cover" sizes="300px" />
            </div>
          ))}
        </div>
        {lightboxIndex !== null && (
          <ImageLightbox images={fullUrls} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
        )}
      </>
    );
  }

  // 4+ images: 2x2 grid, with +N overlay on last tile if > 4
  const shown = imageFiles.slice(0, 4);
  const remaining = imageFiles.length - 4;

  return (
    <>
      <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-lg">
        {shown.map((file, i) => (
          <div key={i} className="relative aspect-square cursor-pointer bg-card" onClick={() => openLightbox(i)}>
            <Image src={getThumbUrl(file)} alt={`Image ${i + 1}`} fill className="object-cover" sizes="300px" />
            {i === 3 && remaining > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-2xl font-bold text-white">
                +{remaining}
              </div>
            )}
          </div>
        ))}
      </div>
      {lightboxIndex !== null && (
        <ImageLightbox images={fullUrls} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </>
  );
}
