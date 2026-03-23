'use client';

import type { PalettePostData, PalettePostMedia } from '../../lib/palette-post-types';
import { getTheme } from '../../lib/card-themes';
import { GridLayout } from './card-layouts/grid-layout';
import { ListLayout } from './card-layouts/list-layout';
import { SwatchesLayout } from './card-layouts/swatches-layout';
import { CircleLayout } from './card-layouts/circle-layout';

interface CardPreviewProps {
  data: PalettePostData;
  cardId?: string;
  size?: number;
}

function MediaThumbnails({ media, theme }: { media: PalettePostMedia[]; theme: ReturnType<typeof getTheme> }) {
  const images = media.filter((m) => m.url || m.file);
  if (images.length === 0) return null;

  return (
    <div className="mt-3 flex gap-2 overflow-hidden">
      {images.slice(0, 3).map((m, i) => {
        const src = m.url || (m.file ? URL.createObjectURL(m.file) : '');
        if (!src) return null;
        return (
          <div
            key={i}
            className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md"
            style={{ border: theme.borderStyle }}
          >
            {m.type === 'video' && m.thumbnail ? (
              <img src={m.thumbnail} alt="" className="h-full w-full object-cover" />
            ) : m.type === 'image' ? (
              <img src={src} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-black/30 text-xs" style={{ color: theme.secondaryText }}>
                Video
              </div>
            )}
          </div>
        );
      })}
      {images.length > 3 && (
        <div
          className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md text-xs font-medium"
          style={{ color: theme.secondaryText, border: theme.borderStyle }}
        >
          +{images.length - 3}
        </div>
      )}
    </div>
  );
}

export function CardPreview({ data, cardId = 'palette-post-card', size = 540 }: CardPreviewProps) {
  const theme = getTheme(data.theme);
  const bgStyle = data.background_color
    ? { backgroundColor: data.background_color }
    : theme.bg.startsWith('linear-gradient')
    ? { backgroundImage: theme.bg }
    : { backgroundColor: theme.bg };

  const Layout = {
    grid: GridLayout,
    list: ListLayout,
    swatches: SwatchesLayout,
    circle: CircleLayout,
  }[data.layout];

  return (
    <div
      id={cardId}
      className="flex flex-col justify-between overflow-hidden"
      style={{
        width: size,
        height: size,
        padding: size * 0.05,
        fontFamily: theme.fontFamily,
        ...bgStyle,
      }}
    >
      {/* Title */}
      {data.title && (
        <h2
          className="mb-3 text-center font-bold"
          style={{
            color: theme.textColor,
            fontSize: size * 0.045,
          }}
        >
          {data.title}
        </h2>
      )}

      {/* Paint layout */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full" style={{ maxWidth: size * 0.85 }}>
          <Layout paints={data.paints} theme={theme} />
        </div>
      </div>

      {/* Media thumbnails */}
      <MediaThumbnails media={data.media} theme={theme} />

      {/* Footer */}
      <div className="mt-3 text-center" style={{ color: theme.secondaryText }}>
        <span style={{ fontSize: size * 0.022 }}>paintpile.com</span>
      </div>
    </div>
  );
}
