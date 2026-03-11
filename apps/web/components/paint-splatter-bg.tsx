'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * Fixed-position spray-paint splatter decorations using AI-generated transparent PNGs.
 * Splatters are positioned in each corner, leaving clean center space for content.
 */
export function PaintSplatterBg() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const dark = resolvedTheme === 'dark';

  const splatters = [
    {
      src: '/splatters/splatter-corner-tl.png',
      style: {
        top: '-5%',
        left: '-5%',
        width: '55vw',
        maxWidth: 750,
      },
    },
    {
      src: '/splatters/splatter-corner-tr.png',
      style: {
        top: '-3%',
        right: '-8%',
        width: '40vw',
        maxWidth: 550,
      },
    },
    {
      src: '/splatters/splatter-corner-bl.png',
      style: {
        bottom: '-5%',
        left: '-3%',
        width: '50vw',
        maxWidth: 680,
      },
    },
    {
      src: '/splatters/splatter-corner-br.png',
      style: {
        bottom: '-8%',
        right: '-5%',
        width: '50vw',
        maxWidth: 680,
      },
    },
  ];

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {splatters.map(({ src, style }) => (
        <img
          key={src}
          src={src}
          alt=""
          className="absolute"
          style={{
            ...style,
            opacity: dark ? 0.45 : 0.25,
            filter: dark ? 'saturate(1.4)' : 'blur(1px) saturate(0.7) brightness(1.3)',
          }}
        />
      ))}
    </div>
  );
}
