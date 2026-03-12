'use client';

import type { TextOverlay } from '@paintpile/shared/src/types/post';

interface TextOverlayRendererProps {
  overlays: TextOverlay[];
  imageIndex: number;
}

function getEffectStyle(effect?: TextOverlay['effect']): React.CSSProperties {
  switch (effect) {
    case 'shadow':
      return { textShadow: '2px 2px 8px rgba(0,0,0,0.8)' };
    case 'outline':
      return {
        WebkitTextStroke: '1.5px rgba(0,0,0,0.8)',
        paintOrder: 'stroke fill',
      } as React.CSSProperties;
    case 'glow':
      return { textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor' };
    case 'neon':
      return {
        textShadow: '0 0 7px #fff, 0 0 10px #fff, 0 0 21px #fff, 0 0 42px currentColor, 0 0 82px currentColor, 0 0 92px currentColor',
      };
    default:
      return { textShadow: '1px 1px 3px rgba(0,0,0,0.5)' };
  }
}

export function TextOverlayRenderer({ overlays, imageIndex }: TextOverlayRendererProps) {
  const thisImageOverlays = overlays.filter((o) => o.imageIndex === imageIndex);

  if (thisImageOverlays.length === 0) return null;

  return (
    <>
      {thisImageOverlays.map((overlay) => (
        <div
          key={overlay.id}
          className="pointer-events-none absolute select-none"
          style={{
            left: `${overlay.x}%`,
            top: `${overlay.y}%`,
            transform: `translate(-50%, -50%)${overlay.rotation ? ` rotate(${overlay.rotation}deg)` : ''}`,
            fontSize: `${overlay.fontSize}px`,
            fontFamily: overlay.fontFamily,
            color: overlay.color,
            opacity: overlay.opacity ?? 1,
            lineHeight: 1.2,
            fontWeight: 700,
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
            ...getEffectStyle(overlay.effect),
          }}
        >
          {overlay.text}
        </div>
      ))}
    </>
  );
}
