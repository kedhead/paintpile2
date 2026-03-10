'use client';

/**
 * Fixed-position spray-paint splatter decorations.
 * Uses CSS radial gradients blurred to look like aerosol overspray.
 */
export function PaintSplatterBg() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Top-left hot pink blob */}
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
          background: 'radial-gradient(circle at 38% 42%, hsl(310 90% 55%) 0%, hsl(285 75% 42%) 45%, transparent 70%)',
          filter: 'blur(80px)',
          opacity: 0.2,
        }}
      />
      {/* Mid-right magenta splatter */}
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
          background: 'radial-gradient(circle at 55% 50%, hsl(325 80% 50%) 0%, hsl(295 65% 38%) 50%, transparent 72%)',
          filter: 'blur(90px)',
          opacity: 0.14,
        }}
      />
      {/* Bottom-left purple/pink splat */}
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
          background: 'radial-gradient(circle at 45% 55%, hsl(280 75% 48%) 0%, hsl(260 60% 35%) 50%, transparent 70%)',
          filter: 'blur(70px)',
          opacity: 0.15,
        }}
      />
      {/* Bottom-right hot pink accent */}
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
          background: 'radial-gradient(circle at 60% 58%, hsl(318 85% 52%) 0%, hsl(275 70% 40%) 48%, transparent 68%)',
          filter: 'blur(85px)',
          opacity: 0.18,
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
          background: 'radial-gradient(circle, hsl(310 95% 60%) 0%, hsl(330 80% 48%) 40%, transparent 70%)',
          filter: 'blur(50px)',
          opacity: 0.12,
        }}
      />
    </div>
  );
}
