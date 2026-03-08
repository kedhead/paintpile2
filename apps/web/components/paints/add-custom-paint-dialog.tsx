'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useCreateCustomPaint } from '../../hooks/use-paints';

interface AddCustomPaintDialogProps {
  open: boolean;
  onClose: () => void;
}

const PAINT_TYPES = [
  'acrylic',
  'contrast',
  'wash',
  'dry',
  'technical',
  'spray',
  'shade',
  'layer',
] as const;

export function AddCustomPaintDialog({ open, onClose }: AddCustomPaintDialogProps) {
  const createCustomPaint = useCreateCustomPaint();
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [type, setType] = useState<string>('acrylic');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brand.trim()) return;

    await createCustomPaint.mutateAsync({
      brand: brand.trim(),
      name: name.trim(),
      color,
      type,
    });

    // Reset and close
    setBrand('');
    setName('');
    setColor('#3b82f6');
    setType('acrylic');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Add Custom Paint</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Brand</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Citadel, Vallejo, Army Painter"
              maxLength={200}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Paint Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Abaddon Black"
              maxLength={200}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-border bg-background"
              />
              <span className="text-sm text-muted-foreground">{color}</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {PAINT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !brand.trim() || createCustomPaint.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/80 disabled:opacity-50"
            >
              {createCustomPaint.isPending ? 'Adding...' : 'Add Paint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
