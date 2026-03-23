'use client';

import { useState, useCallback, useRef } from 'react';
import { Plus, X, GripVertical, Upload, Film } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { RecordModel } from 'pocketbase';
import { PaintSelectorModal } from '../paints/paint-selector-modal';
import type { PalettePostPaint, PalettePostMedia } from '../../lib/palette-post-types';

interface StepPaintSelectionProps {
  paints: PalettePostPaint[];
  media: PalettePostMedia[];
  onPaintsChange: (paints: PalettePostPaint[]) => void;
  onMediaChange: (media: PalettePostMedia[]) => void;
}

function SortablePaintChip({
  paint,
  onRemove,
}: {
  paint: PalettePostPaint;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: paint.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1.5"
    >
      <button className="cursor-grab touch-none" {...attributes} {...listeners}>
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      <div
        className="h-5 w-5 rounded"
        style={{ backgroundColor: paint.hex_color }}
      />
      <span className="text-xs font-medium text-foreground">{paint.name}</span>
      <span className="text-[10px] text-muted-foreground">{paint.brand}</span>
      <button onClick={onRemove} className="ml-1 text-muted-foreground hover:text-foreground">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function StepPaintSelection({
  paints,
  media,
  onPaintsChange,
  onMediaChange,
}: StepPaintSelectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleSelectRecords = useCallback(
    (records: RecordModel[]) => {
      const newPaints: PalettePostPaint[] = records.map((r, i) => ({
        id: r.id,
        name: r.name,
        brand: r.brand || '',
        hex_color: r.hex_color || r.color || '#888888',
        order: paints.length + i,
      }));
      const merged = [...paints, ...newPaints].slice(0, 12);
      onPaintsChange(merged.map((p, i) => ({ ...p, order: i })));
    },
    [paints, onPaintsChange]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = paints.findIndex((p) => p.id === active.id);
        const newIndex = paints.findIndex((p) => p.id === over.id);
        const reordered = arrayMove(paints, oldIndex, newIndex).map((p, i) => ({
          ...p,
          order: i,
        }));
        onPaintsChange(reordered);
      }
    },
    [paints, onPaintsChange]
  );

  const removePaint = useCallback(
    (id: string) => {
      onPaintsChange(
        paints.filter((p) => p.id !== id).map((p, i) => ({ ...p, order: i }))
      );
    },
    [paints, onPaintsChange]
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (media.length + files.length > 5) {
        alert('Maximum 5 media files allowed');
        return;
      }

      const newMedia: PalettePostMedia[] = files.map((file) => ({
        file,
        type: file.type.startsWith('video/') ? 'video' : 'image',
      }));

      // Generate video thumbnails
      for (const m of newMedia) {
        if (m.type === 'video' && m.file) {
          generateVideoThumbnail(m.file).then((thumb) => {
            m.thumbnail = thumb;
            onMediaChange([...media, ...newMedia]);
          });
        }
      }

      onMediaChange([...media, ...newMedia]);
      e.target.value = '';
    },
    [media, onMediaChange]
  );

  const removeMedia = useCallback(
    (index: number) => {
      onMediaChange(media.filter((_, i) => i !== index));
    },
    [media, onMediaChange]
  );

  return (
    <div className="space-y-6">
      {/* Paint Selection */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Paints ({paints.length}/12)
          </h3>
          <button
            onClick={() => setModalOpen(true)}
            disabled={paints.length >= 12}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/80 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Paints
          </button>
        </div>

        {paints.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Select paints to feature on your card
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={paints.map((p) => p.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex flex-wrap gap-2">
                {paints.map((paint) => (
                  <SortablePaintChip
                    key={paint.id}
                    paint={paint}
                    onRemove={() => removePaint(paint.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Media Upload */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Media ({media.length}/5)
          </h3>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={media.length >= 5}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {media.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {media.map((m, i) => {
              const src = m.url || (m.file ? URL.createObjectURL(m.file) : '');
              return (
                <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border">
                  {m.type === 'video' ? (
                    <div className="flex h-full w-full items-center justify-center bg-black/50">
                      {m.thumbnail ? (
                        <img src={m.thumbnail} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Film className="h-6 w-6 text-white" />
                      )}
                    </div>
                  ) : (
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  )}
                  <button
                    onClick={() => removeMedia(i)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PaintSelectorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={() => {}}
        onSelectRecords={handleSelectRecords}
        excludeIds={paints.map((p) => p.id)}
      />
    </div>
  );
}

async function generateVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.src = URL.createObjectURL(file);
    video.onloadeddata = () => {
      video.currentTime = 0.5;
    };
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 160;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, 160, 160);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      } else {
        resolve('');
      }
      URL.revokeObjectURL(video.src);
    };
  });
}
