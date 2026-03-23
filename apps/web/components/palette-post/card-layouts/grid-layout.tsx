'use client';

import type { PalettePostPaint } from '../../../lib/palette-post-types';
import type { CardTheme } from '../../../lib/card-themes';

interface GridLayoutProps {
  paints: PalettePostPaint[];
  theme: CardTheme;
}

export function GridLayout({ paints, theme }: GridLayoutProps) {
  const cols = paints.length <= 4 ? 2 : paints.length <= 9 ? 3 : 4;

  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {paints.map((paint) => (
        <div key={paint.id} className="flex flex-col items-center gap-1.5">
          <div
            className="aspect-square w-full rounded-lg"
            style={{
              backgroundColor: paint.hex_color,
              border: theme.borderStyle,
            }}
          />
          <div className="w-full text-center">
            <p
              className="truncate text-xs font-medium"
              style={{ color: theme.textColor }}
            >
              {paint.name}
            </p>
            <p
              className="truncate text-[10px]"
              style={{ color: theme.secondaryText }}
            >
              {paint.brand}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
