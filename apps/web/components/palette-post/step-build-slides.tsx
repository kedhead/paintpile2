'use client';

import { useCallback, useRef, useState } from 'react';
import { Plus, X, Upload, GripVertical, ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { RecordModel } from 'pocketbase';
import { PaintSelectorModal } from '../paints/paint-selector-modal';
import type { PalettePostData, PalettePostPaint, TutorialStep } from '../../lib/palette-post-types';

const VIDEO_TYPES = 'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,video/ogg';

async function generateVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    video.onloadeddata = () => {
      video.currentTime = 0.5;
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1080;
      canvas.height = video.videoHeight || 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('No canvas context')); return; }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Video load failed'));
    };
  });
}

interface StepBuildSlidesProps {
  data: PalettePostData;
  onChange: (updates: Partial<PalettePostData>) => void;
}

function SortableStepCard({
  step,
  index,
  onUpdate,
  onRemove,
}: {
  step: TutorialStep;
  index: number;
  onUpdate: (updates: Partial<TutorialStep>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  });
  const [expanded, setExpanded] = useState(true);
  const [paintModalOpen, setPaintModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(step.imageUrl || null);
  const [isVideo, setIsVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.type.startsWith('video/')) {
      setIsVideo(true);
      const blobUrl = URL.createObjectURL(file);
      setVideoUrl(blobUrl);
      try {
        const thumbnail = await generateVideoThumbnail(file);
        setPreviewUrl(thumbnail);
        onUpdate({ imageFile: file, imageUrl: thumbnail });
      } catch {
        setPreviewUrl(null);
        onUpdate({ imageFile: file, imageUrl: undefined });
      }
    } else {
      setIsVideo(false);
      setVideoUrl(null);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onUpdate({ imageFile: file, imageUrl: undefined });
    }
  };

  const handlePaintsSelect = (records: RecordModel[]) => {
    const newPaints: PalettePostPaint[] = records.map((r, i) => ({
      id: r.id,
      name: r.name,
      brand: r.brand || '',
      hex_color: r.hex_color || r.color || '#888888',
      order: step.paints.length + i,
    }));
    const merged = [...step.paints, ...newPaints].slice(0, 8);
    onUpdate({ paints: merged.map((p, i) => ({ ...p, order: i })) });
  };

  const removePaint = (id: string) => {
    onUpdate({ paints: step.paints.filter((p) => p.id !== id).map((p, i) => ({ ...p, order: i })) });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Step header */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/40">
        <button className="cursor-grab touch-none text-muted-foreground" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Step {index + 1}
        </span>
        <div className="flex-1" />
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-muted-foreground hover:text-foreground"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <button onClick={onRemove} className="text-muted-foreground hover:text-destructive">
          <X className="h-4 w-4" />
        </button>
      </div>

      {expanded && (
        <div className="p-3 space-y-3">
          {/* Image / video upload */}
          <div className="flex gap-3">
            <div
              className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <>
                  {isVideo && videoUrl ? (
                    <video
                      src={videoUrl}
                      muted
                      autoPlay
                      loop
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload className="h-4 w-4 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Add image/video</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={VIDEO_TYPES}
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* Description */}
            <textarea
              value={step.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Describe this step… Paint names can be bolded in export"
              rows={4}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
            />
          </div>

          {/* Paints for this step */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Paints used ({step.paints.length}/8)
              </span>
              <button
                onClick={() => setPaintModalOpen(true)}
                disabled={step.paints.length >= 8}
                className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/70 disabled:opacity-40"
              >
                <Plus className="h-3 w-3" />
                Add paint
              </button>
            </div>
            {step.paints.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {step.paints.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px]"
                  >
                    <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.hex_color }} />
                    <span className="text-foreground">{p.name}</span>
                    <button onClick={() => removePaint(p.id)} className="text-muted-foreground hover:text-foreground ml-0.5">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <PaintSelectorModal
        open={paintModalOpen}
        onClose={() => setPaintModalOpen(false)}
        onSelect={() => {}}
        onSelectRecords={handlePaintsSelect}
        excludeIds={step.paints.map((p) => p.id)}
      />
    </div>
  );
}

export function StepBuildSlides({ data, onChange }: StepBuildSlidesProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(data.coverImageUrl || null);
  const [coverIsVideo, setCoverIsVideo] = useState(false);
  const [coverVideoUrl, setCoverVideoUrl] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.type.startsWith('video/')) {
      setCoverIsVideo(true);
      const blobUrl = URL.createObjectURL(file);
      setCoverVideoUrl(blobUrl);
      try {
        const thumbnail = await generateVideoThumbnail(file);
        setCoverPreview(thumbnail);
        onChange({ coverImageFile: file, coverImageUrl: thumbnail });
      } catch {
        setCoverPreview(null);
        onChange({ coverImageFile: file, coverImageUrl: undefined });
      }
    } else {
      setCoverIsVideo(false);
      setCoverVideoUrl(null);
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
      onChange({ coverImageFile: file, coverImageUrl: undefined });
    }
  };

  const addStep = useCallback(() => {
    const newStep: TutorialStep = {
      id: crypto.randomUUID(),
      description: '',
      paints: [],
    };
    onChange({ steps: [...data.steps, newStep] });
  }, [data.steps, onChange]);

  const updateStep = useCallback(
    (id: string, updates: Partial<TutorialStep>) => {
      onChange({
        steps: data.steps.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      });
    },
    [data.steps, onChange]
  );

  const removeStep = useCallback(
    (id: string) => {
      onChange({ steps: data.steps.filter((s) => s.id !== id) });
    },
    [data.steps, onChange]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = data.steps.findIndex((s) => s.id === active.id);
        const newIndex = data.steps.findIndex((s) => s.id === over.id);
        onChange({ steps: arrayMove(data.steps, oldIndex, newIndex) });
      }
    },
    [data.steps, onChange]
  );

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-foreground">Post Type</label>
        <div className="flex gap-2">
          {(['tutorial', 'single'] as const).map((m) => (
            <button
              key={m}
              onClick={() => onChange({ mode: m })}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                data.mode === m
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {m === 'tutorial' ? '📖 Tutorial (multi-slide)' : '🎨 Single Post'}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {data.mode === 'tutorial'
            ? 'Create a step-by-step tutorial carousel like an Instagram tutorial post.'
            : 'Create a single card showing your paint palette.'}
        </p>
      </div>

      {/* Basic info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground">Title</label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder={data.mode === 'tutorial' ? 'e.g. White Armour Tutorial' : 'e.g. My Paint Palette'}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground">Attribution</label>
          <input
            type="text"
            value={data.attribution}
            onChange={(e) => onChange({ attribution: e.target.value })}
            placeholder="paintpile.com"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Cover image / video */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">
          {data.mode === 'tutorial' ? 'Cover Image / Video' : 'Post Image / Video'}
        </label>
        <div
          className="group relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary hover:bg-muted/60"
          onClick={() => coverInputRef.current?.click()}
          style={{ height: 160 }}
        >
          {coverIsVideo && coverVideoUrl ? (
            <>
              <video
                src={coverVideoUrl}
                muted
                autoPlay
                loop
                playsInline
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex flex-col items-center gap-1 text-white">
                  <Upload className="h-6 w-6" />
                  <span className="text-xs font-medium">Change video</span>
                </div>
              </div>
            </>
          ) : coverPreview ? (
            <>
              <img src={coverPreview} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex flex-col items-center gap-1 text-white">
                  <Upload className="h-6 w-6" />
                  <span className="text-xs font-medium">Change image</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Click to upload image or video</span>
              <span className="text-xs text-muted-foreground">JPG, PNG, WebP, MP4, WebM</span>
            </div>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept={VIDEO_TYPES}
            onChange={handleCoverImage}
            className="hidden"
          />
        </div>
      </div>

      {/* Tutorial steps */}
      {data.mode === 'tutorial' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">
              Steps ({data.steps.length})
            </label>
            <button
              onClick={addStep}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/80"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Step
            </button>
          </div>

          {data.steps.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Add steps to build your tutorial. Each step gets its own slide card.
              </p>
              <button
                onClick={addStep}
                className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
              >
                Add first step
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={data.steps.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {data.steps.map((step, i) => (
                    <SortableStepCard
                      key={step.id}
                      step={step}
                      index={i}
                      onUpdate={(updates) => updateStep(step.id, updates)}
                      onRemove={() => removeStep(step.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}

      {/* Single mode: paint selection */}
      {data.mode === 'single' && (
        <SingleModePaints data={data} onChange={onChange} />
      )}
    </div>
  );
}

function SingleModePaints({ data, onChange }: StepBuildSlidesProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleSelectRecords = useCallback(
    (records: RecordModel[]) => {
      const newPaints: PalettePostPaint[] = records.map((r, i) => ({
        id: r.id,
        name: r.name,
        brand: r.brand || '',
        hex_color: r.hex_color || r.color || '#888888',
        order: data.paints.length + i,
      }));
      const merged = [...data.paints, ...newPaints].slice(0, 12);
      onChange({ paints: merged.map((p, i) => ({ ...p, order: i })) });
    },
    [data.paints, onChange]
  );

  const removePaint = (id: string) => {
    onChange({ paints: data.paints.filter((p) => p.id !== id).map((p, i) => ({ ...p, order: i })) });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-foreground">Paints ({data.paints.length}/12)</label>
        <button
          onClick={() => setModalOpen(true)}
          disabled={data.paints.length >= 12}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/80 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Paints
        </button>
      </div>

      {data.paints.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">Select paints to feature on your card</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {data.paints.map((paint) => (
            <div
              key={paint.id}
              className="flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs"
            >
              <div className="h-3.5 w-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: paint.hex_color }} />
              <span className="text-foreground font-medium">{paint.name}</span>
              <span className="text-muted-foreground">{paint.brand}</span>
              <button onClick={() => removePaint(paint.id)} className="ml-0.5 text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <PaintSelectorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={() => {}}
        onSelectRecords={handleSelectRecords}
        excludeIds={data.paints.map((p) => p.id)}
      />
    </div>
  );
}
