'use client';

import { Grid3X3, List, Circle, Square } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { useState } from 'react';
import { CARD_THEMES, getTheme } from '../../lib/card-themes';
import { CardPreview } from './card-preview';
import type { PalettePostData } from '../../lib/palette-post-types';

interface StepCardCustomizationProps {
  data: PalettePostData;
  onChange: (updates: Partial<PalettePostData>) => void;
}

const LAYOUTS = [
  { key: 'grid' as const, label: 'Grid', icon: Grid3X3 },
  { key: 'list' as const, label: 'List', icon: List },
  { key: 'swatches' as const, label: 'Swatches', icon: Square },
  { key: 'circle' as const, label: 'Circle', icon: Circle },
];

export function StepCardCustomization({ data, onChange }: StepCardCustomizationProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Controls */}
      <div className="space-y-5 lg:w-72">
        {/* Title */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground">Title</label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="My Paint Palette"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* Theme */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground">Theme</label>
          <div className="flex flex-wrap gap-2">
            {Object.values(CARD_THEMES).map((theme) => {
              const isActive = data.theme === theme.key;
              const bg = theme.bg.startsWith('linear-gradient') ? theme.bg : undefined;
              const bgColor = !bg ? theme.bg : undefined;
              return (
                <button
                  key={theme.key}
                  onClick={() => onChange({ theme: theme.key })}
                  className={`flex flex-col items-center gap-1 rounded-lg p-1.5 transition-colors ${
                    isActive ? 'ring-2 ring-primary' : 'hover:bg-muted'
                  }`}
                >
                  <div
                    className="h-8 w-12 rounded"
                    style={{
                      backgroundImage: bg,
                      backgroundColor: bgColor,
                      border: `1px solid ${theme.accentColor}`,
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground">{theme.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Layout */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground">Layout</label>
          <div className="flex gap-2">
            {LAYOUTS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => onChange({ layout: key })}
                className={`flex flex-col items-center gap-1 rounded-lg border px-3 py-2 text-xs transition-colors ${
                  data.layout === key
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Background Color */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">Background Color</label>
            {data.background_color && (
              <button
                onClick={() => onChange({ background_color: '' })}
                className="text-[10px] text-muted-foreground hover:text-foreground"
              >
                Reset to theme
              </button>
            )}
          </div>
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-muted"
          >
            <div
              className="h-5 w-5 rounded border border-border"
              style={{
                backgroundColor: data.background_color || getTheme(data.theme).bg,
              }}
            />
            {data.background_color || 'Theme default'}
          </button>
          {showColorPicker && (
            <div className="mt-2">
              <HexColorPicker
                color={data.background_color || getTheme(data.theme).bg}
                onChange={(color) => onChange({ background_color: color })}
              />
            </div>
          )}
        </div>
      </div>

      {/* Live Preview */}
      <div className="flex flex-1 items-start justify-center">
        <div className="overflow-hidden rounded-xl border border-border shadow-lg">
          <CardPreview data={data} size={400} />
        </div>
      </div>
    </div>
  );
}
