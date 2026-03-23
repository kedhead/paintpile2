'use client';

import type { PalettePostPaint } from '../../../lib/palette-post-types';
import type { CardTheme } from '../../../lib/card-themes';

interface CircleLayoutProps {
  paints: PalettePostPaint[];
  theme: CardTheme;
}

export function CircleLayout({ paints, theme }: CircleLayoutProps) {
  const count = paints.length;
  const radius = 120;
  const centerX = 150;
  const centerY = 150;

  return (
    <div className="relative mx-auto" style={{ width: 300, height: 300 }}>
      {paints.map((paint, i) => {
        const angle = (2 * Math.PI * i) / count - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle) - 28;
        const y = centerY + radius * Math.sin(angle) - 28;

        return (
          <div
            key={paint.id}
            className="absolute flex flex-col items-center"
            style={{ left: x, top: y }}
          >
            <div
              className="h-14 w-14 rounded-full shadow-md"
              style={{
                backgroundColor: paint.hex_color,
                border: theme.borderStyle,
              }}
            />
            <p
              className="mt-1 max-w-[70px] truncate text-center text-[9px] font-medium"
              style={{ color: theme.textColor }}
            >
              {paint.name}
            </p>
          </div>
        );
      })}
    </div>
  );
}
