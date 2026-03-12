'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Plus, Type, RotateCw, Trash2 } from 'lucide-react';
import Image from 'next/image';
import type { TextOverlay } from '@paintpile/shared/src/types/post';
import { TextOverlayRenderer } from './text-overlay-renderer';

const FONTS = [
  { label: 'Impact', value: 'Impact, sans-serif' },
  { label: 'Outfit', value: "'Outfit', sans-serif" },
  { label: 'Brush', value: "'Permanent Marker', cursive" },
  { label: 'Mono', value: "'JetBrains Mono', monospace" },
  { label: 'Serif', value: 'Georgia, serif' },
];

const EFFECTS: { label: string; value: TextOverlay['effect'] }[] = [
  { label: 'None', value: 'none' },
  { label: 'Shadow', value: 'shadow' },
  { label: 'Outline', value: 'outline' },
  { label: 'Glow', value: 'glow' },
  { label: 'Neon', value: 'neon' },
];

const PRESET_COLORS = [
  '#FFFFFF', '#000000', '#FF3B30', '#FF9500', '#FFCC00',
  '#34C759', '#007AFF', '#AF52DE', '#FF2D55', '#5AC8FA',
];

interface TextOverlayEditorProps {
  imageUrl: string;
  imageIndex: number;
  overlays: TextOverlay[];
  onSave: (overlays: TextOverlay[]) => void;
  onClose: () => void;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function TextOverlayEditor({
  imageUrl,
  imageIndex,
  overlays: initialOverlays,
  onSave,
  onClose,
}: TextOverlayEditorProps) {
  const [overlays, setOverlays] = useState<TextOverlay[]>(
    initialOverlays.filter((o) => o.imageIndex === imageIndex)
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; overlayX: number; overlayY: number } | null>(null);

  const selected = overlays.find((o) => o.id === selectedId);

  const addOverlay = () => {
    const newOverlay: TextOverlay = {
      id: generateId(),
      text: 'Your text',
      imageIndex,
      x: 50,
      y: 50,
      fontSize: 32,
      fontFamily: FONTS[0].value,
      color: '#FFFFFF',
      effect: 'shadow',
      opacity: 1,
      rotation: 0,
    };
    setOverlays((prev) => [...prev, newOverlay]);
    setSelectedId(newOverlay.id);
  };

  const updateOverlay = (id: string, updates: Partial<TextOverlay>) => {
    setOverlays((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  };

  const deleteOverlay = (id: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, overlayId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedId(overlayId);
      const overlay = overlays.find((o) => o.id === overlayId);
      if (!overlay) return;
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        overlayX: overlay.x,
        overlayY: overlay.y,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [overlays]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current || !selectedId || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
      const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100;
      const newX = Math.max(0, Math.min(100, dragRef.current.overlayX + dx));
      const newY = Math.max(0, Math.min(100, dragRef.current.overlayY + dy));
      updateOverlay(selectedId, { x: newX, y: newY });
    },
    [selectedId]
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleSave = () => {
    onSave(overlays.map((o) => ({ ...o, imageIndex })));
    onClose();
  };

  // Load Google Fonts for the fun fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=Permanent+Marker&family=JetBrains+Mono:wght@700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={onClose}>
      <div
        className="flex w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Text Overlay Editor</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={addOverlay}
              className="flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Text
            </button>
            <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="relative flex-1 bg-black/50 p-4">
          <div
            ref={containerRef}
            className="relative mx-auto aspect-[4/3] max-h-[55vh] overflow-hidden rounded-lg"
            onClick={() => setSelectedId(null)}
          >
            <Image src={imageUrl} alt="Edit overlay" fill className="object-cover" sizes="700px" />
            <TextOverlayRenderer overlays={overlays} imageIndex={imageIndex} />
            {/* Draggable handles */}
            {overlays.map((overlay) => (
              <div
                key={overlay.id}
                className={`absolute cursor-move touch-none ${
                  selectedId === overlay.id ? 'ring-2 ring-primary ring-offset-1' : ''
                }`}
                style={{
                  left: `${overlay.x}%`,
                  top: `${overlay.y}%`,
                  transform: 'translate(-50%, -50%)',
                  padding: '4px 8px',
                  borderRadius: 4,
                }}
                onPointerDown={(e) => handlePointerDown(e, overlay.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                {/* Invisible drag target sized to the text */}
                <span style={{ fontSize: overlay.fontSize, fontFamily: overlay.fontFamily, visibility: 'hidden', fontWeight: 700 }}>
                  {overlay.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Toolbar — only when overlay is selected */}
        {selected && (
          <div className="border-t border-border bg-muted/50 px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Text input */}
              <div className="flex-1">
                <input
                  type="text"
                  value={selected.text}
                  onChange={(e) => updateOverlay(selected.id, { text: e.target.value })}
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter text..."
                />
              </div>

              {/* Font picker */}
              <select
                value={selected.fontFamily}
                onChange={(e) => updateOverlay(selected.id, { fontFamily: e.target.value })}
                className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
              >
                {FONTS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>

              {/* Size slider */}
              <div className="flex items-center gap-1">
                <Type className="h-3 w-3 text-muted-foreground" />
                <input
                  type="range"
                  min={12}
                  max={96}
                  value={selected.fontSize}
                  onChange={(e) => updateOverlay(selected.id, { fontSize: Number(e.target.value) })}
                  className="h-1 w-20 accent-primary"
                />
                <span className="w-6 text-right text-xs text-muted-foreground">{selected.fontSize}</span>
              </div>

              {/* Color swatches */}
              <div className="flex gap-0.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateOverlay(selected.id, { color: c })}
                    className={`h-5 w-5 rounded-full border-2 transition-transform hover:scale-110 ${
                      selected.color === c ? 'border-primary scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              {/* Effect */}
              <select
                value={selected.effect || 'none'}
                onChange={(e) => updateOverlay(selected.id, { effect: e.target.value as TextOverlay['effect'] })}
                className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
              >
                {EFFECTS.map((fx) => (
                  <option key={fx.value} value={fx.value}>
                    {fx.label}
                  </option>
                ))}
              </select>

              {/* Rotation */}
              <button
                onClick={() => updateOverlay(selected.id, { rotation: ((selected.rotation || 0) + 15) % 360 })}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Rotate 15°"
              >
                <RotateCw className="h-4 w-4" />
              </button>

              {/* Delete */}
              <button
                onClick={() => deleteOverlay(selected.id)}
                className="rounded-md p-1 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                title="Delete overlay"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary/80"
          >
            Save Overlays
          </button>
        </div>
      </div>
    </div>
  );
}
