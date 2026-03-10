'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * Fixed-position spray-paint splatter decorations.
 * Dark mode: vibrant neon pink/magenta/purple.
 * Light mode: soft pastel washes.
 */
export function PaintSplatterBg() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const dark = resolvedTheme === 'dark';

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Top-left blob */}
      <div
        className="absolute"
        style={{
          top: '-8%',
          left: '-6%',
          width: '44vw',
          height: '44vw',
          maxWidth: 580,
          maxHeight: 580,
          borderRadius: '50%',
          background: dark
            ? 'radial-gradient(circle at 38% 42%, hsl(310 90% 55%) 0%, hsl(285 75% 42%) 45%, transparent 70%)'
            : 'radial-gradient(circle at 38% 42%, hsl(310 70% 82%) 0%, hsl(285 55% 88%) 45%, transparent 70%)',
          filter: dark ? 'blur(80px)' : 'blur(90px)',
          opacity: dark ? 0.2 : 0.5,
        }}
      />
      {/* Mid-right splatter */}
      <div
        className="absolute"
        style={{
          top: '25%',
          right: '-10%',
          width: '35vw',
          height: '35vw',
          maxWidth: 450,
          maxHeight: 450,
          borderRadius: '50%',
          background: dark
            ? 'radial-gradient(circle at 55% 50%, hsl(325 80% 50%) 0%, hsl(295 65% 38%) 50%, transparent 72%)'
            : 'radial-gradient(circle at 55% 50%, hsl(325 60% 85%) 0%, hsl(295 45% 90%) 50%, transparent 72%)',
          filter: dark ? 'blur(90px)' : 'blur(100px)',
          opacity: dark ? 0.14 : 0.4,
        }}
      />
      {/* Bottom-left splat */}
      <div
        className="absolute"
        style={{
          bottom: '-5%',
          left: '5%',
          width: '30vw',
          height: '30vw',
          maxWidth: 400,
          maxHeight: 400,
          borderRadius: '50%',
          background: dark
            ? 'radial-gradient(circle at 45% 55%, hsl(280 75% 48%) 0%, hsl(260 60% 35%) 50%, transparent 70%)'
            : 'radial-gradient(circle at 45% 55%, hsl(280 50% 85%) 0%, hsl(260 40% 90%) 50%, transparent 70%)',
          filter: dark ? 'blur(70px)' : 'blur(80px)',
          opacity: dark ? 0.15 : 0.45,
        }}
      />
      {/* Bottom-right accent */}
      <div
        className="absolute"
        style={{
          bottom: '-12%',
          right: '-4%',
          width: '48vw',
          height: '48vw',
          maxWidth: 620,
          maxHeight: 620,
          borderRadius: '50%',
          background: dark
            ? 'radial-gradient(circle at 60% 58%, hsl(318 85% 52%) 0%, hsl(275 70% 40%) 48%, transparent 68%)'
            : 'radial-gradient(circle at 60% 58%, hsl(318 60% 84%) 0%, hsl(275 45% 90%) 48%, transparent 68%)',
          filter: dark ? 'blur(85px)' : 'blur(95px)',
          opacity: dark ? 0.18 : 0.45,
        }}
      />
      {/* Small bright accent - top center-right */}
      <div
        className="absolute"
        style={{
          top: '8%',
          right: '18%',
          width: '15vw',
          height: '15vw',
          maxWidth: 220,
          maxHeight: 220,
          borderRadius: '50%',
          background: dark
            ? 'radial-gradient(circle, hsl(310 95% 60%) 0%, hsl(330 80% 48%) 40%, transparent 70%)'
            : 'radial-gradient(circle, hsl(310 60% 85%) 0%, hsl(330 50% 88%) 40%, transparent 70%)',
          filter: dark ? 'blur(50px)' : 'blur(60px)',
          opacity: dark ? 0.12 : 0.4,
        }}
      />
    </div>
  );
}
