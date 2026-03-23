'use client';

import type { PalettePostPaint } from '../../../lib/palette-post-types';
import type { CardTheme } from '../../../lib/card-themes';

interface SwatchesLayoutProps {
  paints: PalettePostPaint[];
  theme: CardTheme;
}

export function SwatchesLayout({ paints, theme }: SwatchesLayoutProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {paints.map((paint) => (
        <div
          key={paint.id}
          className="h-20 w-20 rounded-xl shadow-md"
          style={{
            backgroundColor: paint.hex_color,
            border: theme.borderStyle,
          }}
          title={`${paint.name} — ${paint.brand}`}
        />
      ))}
    </div>
  );
}
