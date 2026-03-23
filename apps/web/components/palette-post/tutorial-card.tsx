'use client';

import { useEffect, useState } from 'react';
import type { PalettePostPaint } from '../../lib/palette-post-types';

export interface TutorialCardProps {
  type: 'cover' | 'step';
  title?: string;
  stepNumber?: number;
  description?: string;
  imageFile?: File;
  imageUrl?: string;
  attribution?: string;
  paints?: PalettePostPaint[];
  currentCardIndex: number;
  totalCards: number;
  cardBg?: string;
  size?: number;
  cardId?: string;
}

export function TutorialCard({
  type,
  title = '',
  stepNumber = 1,
  description = '',
  imageFile,
  imageUrl,
  attribution = 'paintpile.com',
  paints = [],
  currentCardIndex,
  totalCards,
  cardBg = '#ffffff',
  size = 540,
  cardId,
}: TutorialCardProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(imageUrl || null);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageSrc(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImageSrc(imageUrl || null);
    }
  }, [imageFile, imageUrl]);

  const pad = size * 0.05;
  const imageHeight = size * 0.55;
  const imageRadius = size * 0.025;
  const labelSize = size * 0.022;
  const titleSize = type === 'cover' ? size * 0.095 : size * 0.034;
  const bodySize = size * 0.033;
  const attrSize = size * 0.02;
  const dotDiameter = size * 0.014;
  const counterDiameter = size * 0.062;

  const isDark = cardBg === '#000000' || cardBg.startsWith('linear');
  const textPrimary = isDark ? '#ffffff' : '#111827';
  const textSecondary = isDark ? 'rgba(255,255,255,0.5)' : '#9ca3af';
  const dotInactive = isDark ? 'rgba(255,255,255,0.25)' : '#d1d5db';
  const dotActive = isDark ? '#ffffff' : '#111827';
  const counterBg = isDark ? '#ffffff' : '#111827';
  const counterText = isDark ? '#111827' : '#ffffff';

  return (
    <div
      id={cardId}
      style={{
        width: size,
        height: size,
        backgroundColor: cardBg,
        display: 'flex',
        flexDirection: 'column',
        padding: pad,
        boxSizing: 'border-box',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Image / swatch area */}
      <div
        style={{
          width: '100%',
          height: imageHeight,
          borderRadius: imageRadius,
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
        }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : paints.length > 0 ? (
          <div style={{ display: 'flex', height: '100%' }}>
            {paints.slice(0, 8).map((p) => (
              <div key={p.id} style={{ flex: 1, backgroundColor: p.hex_color }} />
            ))}
          </div>
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width={size * 0.1} height={size * 0.1} viewBox="0 0 24 24" fill="none" stroke={textSecondary} strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: pad * 0.55,
          minHeight: 0,
        }}
      >
        {/* Label */}
        <div
          style={{
            fontSize: labelSize,
            fontWeight: 600,
            letterSpacing: '0.13em',
            textTransform: 'uppercase',
            color: textSecondary,
            marginBottom: pad * 0.25,
            lineHeight: 1,
          }}
        >
          {type === 'cover' ? 'Tutorial:' : `Step ${String(stepNumber).padStart(2, '0')}:`}
        </div>

        {/* Title or description */}
        {type === 'cover' ? (
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 800,
              color: textPrimary,
              lineHeight: 1.05,
              flex: 1,
              wordBreak: 'break-word',
              overflow: 'hidden',
            }}
          >
            {title || 'My Tutorial'}
          </div>
        ) : (
          <div
            style={{
              fontSize: bodySize,
              fontWeight: 400,
              color: textPrimary,
              lineHeight: 1.5,
              flex: 1,
              overflow: 'hidden',
            }}
          >
            {description}
          </div>
        )}

        {/* Bottom row: attribution | dots | counter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: pad * 0.4,
            flexShrink: 0,
          }}
        >
          {/* Attribution */}
          <div
            style={{
              fontSize: attrSize,
              color: textSecondary,
              flex: 1,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {attribution}
          </div>

          {/* Pagination dots */}
          {totalCards > 1 && (
            <div
              style={{
                display: 'flex',
                gap: dotDiameter * 0.55,
                alignItems: 'center',
                flex: 2,
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {Array.from({ length: Math.min(totalCards, 9) }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === currentCardIndex ? dotDiameter * 1.3 : dotDiameter,
                    height: i === currentCardIndex ? dotDiameter * 1.3 : dotDiameter,
                    borderRadius: '50%',
                    backgroundColor: i === currentCardIndex ? dotActive : dotInactive,
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </div>
          )}

          {/* Step counter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: dotDiameter * 0.6,
              flex: 1,
              justifyContent: 'flex-end',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: counterDiameter,
                height: counterDiameter,
                borderRadius: '50%',
                backgroundColor: counterBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: counterText,
                fontSize: counterDiameter * 0.42,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {currentCardIndex + 1}
            </div>
            <span
              style={{
                fontSize: counterDiameter * 0.42,
                color: textPrimary,
                fontWeight: 600,
              }}
            >
              →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
