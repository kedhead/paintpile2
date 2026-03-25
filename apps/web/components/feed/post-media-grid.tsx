'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, Film } from 'lucide-react';
import type { RecordModel } from 'pocketbase';
import type { TextOverlay } from '@paintpile/shared/src/types/post';
import { getFileUrl } from '../../lib/pb-helpers';
import { TextOverlayRenderer } from './text-overlay-renderer';

interface PostMediaGridProps {
  post: RecordModel;
}

interface MediaItem {
  type: 'image' | 'video';
  filename: string;
  thumbUrl: string;
  fullUrl: string;
}

function MediaLightbox({
  items,
  initialIndex,
  onClose,
  textOverlays,
}: {
  items: MediaItem[];
  initialIndex: number;
  onClose: () => void;
  textOverlays: TextOverlay[];
}) {
  const [index, setIndex] = useState(initialIndex);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const current = items[index];

  // Zoom state (images only)
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const pinchDist = useRef<number | null>(null);

  useEffect(() => { setScale(1); setOffset({ x: 0, y: 0 }); }, [index]);

  const handleWheel = (e: React.WheelEvent) => {
    if (current.type !== 'image') return;
    e.preventDefault();
    e.stopPropagation();
    setScale((s) => {
      const next = Math.max(1, Math.min(4, s - e.deltaY * 0.001));
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (current.type !== 'image') return;
    e.stopPropagation();
    setScale((s) => { if (s > 1) { setOffset({ x: 0, y: 0 }); return 1; } return 2; });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1 || current.type !== 'image') return;
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  const handleMouseUp = () => setDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchDist.current !== null) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      setScale((s) => {
        const next = Math.max(1, Math.min(4, s * (dist / pinchDist.current!)));
        if (next === 1) setOffset({ x: 0, y: 0 });
        return next;
      });
      pinchDist.current = dist;
    }
  };

  const handleTouchEnd = () => { pinchDist.current = null; };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(!muted);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
      >
        <X className="h-5 w-5" />
      </button>

      {items.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i - 1 + items.length) % items.length);
              setPlaying(false);
            }}
            className="absolute left-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i + 1) % items.length);
              setPlaying(false);
            }}
            className="absolute right-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
            style={{ top: '50%', transform: 'translateY(-50%)', right: '1rem' }}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      <div
        className="relative max-h-[90vh] max-w-[90vw] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: current.type === 'image' && scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'default' }}
      >
        {current.type === 'image' ? (
          <div
            className="relative"
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            style={{
              transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
              transformOrigin: 'center',
              transition: dragging ? 'none' : 'transform 0.15s ease',
            }}
          >
            <img
              src={current.fullUrl}
              alt="Full size"
              className="max-h-[90vh] max-w-[90vw] object-contain select-none"
              draggable={false}
            />
            <TextOverlayRenderer
              overlays={textOverlays}
              imageIndex={getImageIndex(items, index)}
            />
          </div>
        ) : (
          <div className="relative">
            <video
              ref={videoRef}
              src={current.fullUrl}
              className="max-h-[90vh] max-w-[90vw] rounded-lg"
              controls={false}
              onEnded={() => setPlaying(false)}
              onClick={togglePlay}
            />
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
              >
                {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-white" />}
              </button>
              <button
                onClick={toggleMute}
                className="rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
              >
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {items.length > 1 && (
        <div className="absolute bottom-4 flex items-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIndex(i); setPlaying(false); }}
              className={`h-2 rounded-full transition-all ${
                i === index ? 'w-6 bg-white' : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getImageIndex(items: MediaItem[], currentIndex: number): number {
  let imageIdx = 0;
  for (let i = 0; i < currentIndex; i++) {
    if (items[i].type === 'image') imageIdx++;
  }
  return imageIdx;
}

function VideoTile({
  src,
  onClick,
  className,
  sizes,
}: {
  src: string;
  onClick: () => void;
  className?: string;
  sizes?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    videoRef.current?.play().catch(() => {});
  };
  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className={`relative cursor-pointer bg-card ${className || ''}`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="rounded-full bg-black/50 p-2">
          <Play className="h-5 w-5 fill-white text-white" />
        </div>
      </div>
      <div className="pointer-events-none absolute right-1.5 top-1.5">
        <Film className="h-4 w-4 text-white drop-shadow-lg" />
      </div>
    </div>
  );
}

export function PostMediaGrid({ post }: PostMediaGridProps) {
  const imageFiles: string[] = post.images || [];
  const videoFiles: string[] = post.videos || [];
  const textOverlays: TextOverlay[] = post.text_overlays || [];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const items: MediaItem[] = [
    ...imageFiles.map((f) => ({
      type: 'image' as const,
      filename: f,
      thumbUrl: getFileUrl(post, f, '600x600'),
      fullUrl: getFileUrl(post, f),
    })),
    ...videoFiles.map((f) => ({
      type: 'video' as const,
      filename: f,
      thumbUrl: getFileUrl(post, f),
      fullUrl: getFileUrl(post, f),
    })),
  ];

  if (items.length === 0) return null;

  const openLightbox = (i: number) => setLightboxIndex(i);

  const renderTile = (item: MediaItem, index: number, aspectClass: string, sizesHint: string) => {
    if (item.type === 'video') {
      return (
        <VideoTile
          key={index}
          src={item.fullUrl}
          onClick={() => openLightbox(index)}
          className={aspectClass}
          sizes={sizesHint}
        />
      );
    }
    const imageIdx = getImageIndex(items, index);
    return (
      <div
        key={index}
        className={`relative cursor-pointer bg-card ${aspectClass}`}
        onClick={() => openLightbox(index)}
      >
        <Image
          src={item.thumbUrl}
          alt={`Post media ${index + 1}`}
          fill
          className="object-cover"
          sizes={sizesHint}
        />
        <TextOverlayRenderer overlays={textOverlays} imageIndex={imageIdx} />
      </div>
    );
  };

  if (items.length === 1) {
    return (
      <>
        <div className="mt-3 overflow-hidden rounded-lg">
          {renderTile(items[0], 0, 'aspect-[4/3]', '(max-width: 640px) 100vw, 600px')}
        </div>
        {lightboxIndex !== null && (
          <MediaLightbox
            items={items}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            textOverlays={textOverlays}
          />
        )}
      </>
    );
  }

  if (items.length === 2) {
    return (
      <>
        <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-lg">
          {items.map((item, i) => renderTile(item, i, 'aspect-square', '300px'))}
        </div>
        {lightboxIndex !== null && (
          <MediaLightbox
            items={items}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            textOverlays={textOverlays}
          />
        )}
      </>
    );
  }

  if (items.length === 3) {
    return (
      <>
        <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-lg">
          {renderTile(items[0], 0, 'row-span-2 aspect-[2/3]', '300px')}
          {items.slice(1).map((item, i) => renderTile(item, i + 1, 'aspect-square', '300px'))}
        </div>
        {lightboxIndex !== null && (
          <MediaLightbox
            items={items}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            textOverlays={textOverlays}
          />
        )}
      </>
    );
  }

  // 4+ items: 2x2 grid with +N overlay on last tile
  const shown = items.slice(0, 4);
  const remaining = items.length - 4;

  return (
    <>
      <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-lg">
        {shown.map((item, i) => (
          <div key={i} className="relative">
            {renderTile(item, i, 'aspect-square', '300px')}
            {i === 3 && remaining > 0 && (
              <div
                className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 text-2xl font-bold text-white"
                onClick={() => openLightbox(i)}
              >
                +{remaining}
              </div>
            )}
          </div>
        ))}
      </div>
      {lightboxIndex !== null && (
        <MediaLightbox
          items={items}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          textOverlays={textOverlays}
        />
      )}
    </>
  );
}
