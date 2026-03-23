'use client';

import type { PalettePostPaint } from '../../../lib/palette-post-types';
import type { CardTheme } from '../../../lib/card-themes';

interface ListLayoutProps {
  paints: PalettePostPaint[];
  theme: CardTheme;
}

export function ListLayout({ paints, theme }: ListLayoutProps) {
  return (
    <div className="flex flex-col gap-2">
      {paints.map((paint) => (
        <div key={paint.id} className="flex items-center gap-3">
          <div
            className="h-8 w-12 flex-shrink-0 rounded"
            style={{
              backgroundColor: paint.hex_color,
              border: theme.borderStyle,
            }}
          />
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-medium"
              style={{ color: theme.textColor }}
            >
              {paint.name}
            </p>
            <p
              className="truncate text-xs"
              style={{ color: theme.secondaryText }}
            >
              {paint.brand}
            </p>
          </div>
          <span
            className="flex-shrink-0 text-[10px] font-mono"
            style={{ color: theme.secondaryText }}
          >
            {paint.hex_color}
          </span>
        </div>
      ))}
    </div>
  );
}
