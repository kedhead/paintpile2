'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { CarouselPreview } from './carousel-preview';
import type { PalettePostData } from '../../lib/palette-post-types';

interface StepCardCustomizationProps {
  data: PalettePostData;
  onChange: (updates: Partial<PalettePostData>) => void;
}

const CARD_STYLES = [
  { key: 'clean-white', label: 'Clean', bg: '#ffffff', preview: 'bg-white' },
  { key: 'warm', label: 'Warm', bg: '#fdf6e3', preview: 'bg-amber-50' },
  { key: 'cool', label: 'Cool', bg: '#f0f9ff', preview: 'bg-sky-50' },
  { key: 'dark', label: 'Dark', bg: '#111827', preview: 'bg-gray-900' },
  { key: 'midnight', label: 'Midnight', bg: '#0f0c29', preview: 'bg-indigo-950' },
  { key: 'custom', label: 'Custom', bg: '', preview: '' },
] as const;

export function StepCardCustomization({ data, onChange }: StepCardCustomizationProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [customColor, setCustomColor] = useState(data.background_color || '#ffffff');

  const activeStyle =
    CARD_STYLES.find((s) => s.key !== 'custom' && s.bg === data.background_color) ||
    (data.background_color ? CARD_STYLES.find((s) => s.key === 'custom') : CARD_STYLES[0]);

  const handleStyleSelect = (style: (typeof CARD_STYLES)[number]) => {
    if (style.key === 'custom') {
      setShowPicker(true);
      onChange({ background_color: customColor });
    } else {
      setShowPicker(false);
      onChange({ background_color: style.bg });
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Controls */}
      <div className="space-y-5 lg:w-64">
        <div>
          <label className="mb-2 block text-xs font-semibold text-foreground">Card Background</label>
          <div className="grid grid-cols-3 gap-2">
            {CARD_STYLES.map((style) => {
              const isActive = activeStyle?.key === style.key;
              return (
                <button
                  key={style.key}
                  onClick={() => handleStyleSelect(style)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-colors ${
                    isActive ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                  }`}
                >
                  {style.key === 'custom' ? (
                    <div
                      className="h-8 w-full rounded"
                      style={{
                        background:
                          'linear-gradient(135deg, #ff6b6b 0%, #feca57 25%, #48dbfb 50%, #ff9ff3 75%, #54a0ff 100%)',
                      }}
                    />
                  ) : (
                    <div
                      className="h-8 w-full rounded border border-border/50"
                      style={{ backgroundColor: style.bg }}
                    />
                  )}
                  <span className="text-[10px] text-muted-foreground">{style.label}</span>
                </button>
              );
            })}
          </div>

          {showPicker && (
            <div className="mt-3">
              <HexColorPicker
                color={customColor}
                onChange={(color) => {
                  setCustomColor(color);
                  onChange({ background_color: color });
                }}
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">{customColor}</p>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-3 text-[11px] text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground text-xs">Card Style Tips</p>
          <p>• White/light backgrounds photograph best</p>
          <p>• Dark backgrounds work great for bold palettes</p>
          <p>• Your attribution appears on every card</p>
        </div>
      </div>

      {/* Live carousel preview */}
      <div className="flex flex-1 items-start justify-center">
        <div className="w-full max-w-[460px]">
          <p className="mb-3 text-center text-xs text-muted-foreground">
            Preview — use arrows to browse cards
          </p>
          <CarouselPreview data={data} size={380} />
        </div>
      </div>
    </div>
  );
}
