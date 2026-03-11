'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * Fixed-position spray-paint splatter decorations using AI-generated transparent PNGs.
 */
export function PaintSplatterBg() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const dark = resolvedTheme === 'dark';

  const splatters = [
    {
      src: '/splatters/splatter-pink-1.png',
      style: {
        top: '-10%',
        left: '-8%',
        width: '50vw',
        maxWidth: 700,
      },
    },
    {
      src: '/splatters/splatter-blue-1.png',
      style: {
        top: '20%',
        right: '-12%',
        width: '40vw',
        maxWidth: 550,
      },
    },
    {
      src: '/splatters/splatter-purple-1.png',
      style: {
        bottom: '-8%',
        left: '2%',
        width: '38vw',
        maxWidth: 500,
      },
    },
    {
      src: '/splatters/splatter-pink-2.png',
      style: {
        bottom: '-15%',
        right: '-5%',
        width: '45vw',
        maxWidth: 620,
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
            opacity: dark ? 0.4 : 0.2,
            filter: dark ? 'blur(1px) saturate(1.4)' : 'blur(2px) saturate(0.5) brightness(1.5)',
          }}
        />
      ))}
    </div>
  );
}
