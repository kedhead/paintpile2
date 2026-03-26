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
  const isVideo = !!imageFile?.type.startsWith('video/');

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
  const imageHeight = size * 0.52;
  const imageRadius = size * 0.025;
  const labelSize = size * 0.022;
  const titleSize = type === 'cover' ? size * 0.095 : size * 0.034;
  const bodySize = size * 0.033;
  const attrSize = size * 0.02;
  const dotDiameter = size * 0.014;
  const counterDiameter = size * 0.062;
  const paintDot = size * 0.022;
  const paintTextSize = size * 0.024;

  const isDark = cardBg === '#000000' || cardBg.startsWith('linear');
  const textPrimary = isDark ? '#ffffff' : '#111827';
  const textSecondary = isDark ? 'rgba(255,255,255,0.5)' : '#9ca3af';
  const dotInactive = isDark ? 'rgba(255,255,255,0.25)' : '#d1d5db';
  const dotActive = isDark ? '#ffffff' : '#111827';
  const counterBg = isDark ? '#ffffff' : '#111827';
  const counterText = isDark ? '#111827' : '#ffffff';
  const paintsBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';

  const visiblePaints = paints.slice(0, 6);
  const extraPaints = paints.length > 6 ? paints.length - 6 : 0;

  return (
    <div
      id={cardId}
      style={{
        width: size,
        minHeight: size,
        backgroundColor: cardBg,
        display: 'flex',
        flexDirection: 'column',
        padding: pad,
        boxSizing: 'border-box',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        flexShrink: 0,
      }}
    >
      {/* Image / video / swatch area */}
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
        {isVideo && imageSrc ? (
          <video
            src={imageSrc}
            muted
            autoPlay
            loop
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : imageSrc ? (
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

      {/* Paint names — shown when paints are provided */}
      {paints.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: pad * 0.35,
            marginTop: pad * 0.35,
            padding: `${pad * 0.3}px ${pad * 0.4}px`,
            backgroundColor: paintsBg,
            borderRadius: imageRadius * 0.6,
            flexShrink: 0,
          }}
        >
          {visiblePaints.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: paintDot * 0.55,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: paintDot,
                  height: paintDot,
                  borderRadius: '50%',
                  backgroundColor: p.hex_color,
                  flexShrink: 0,
                  boxShadow: isDark ? '0 0 0 1px rgba(255,255,255,0.15)' : '0 0 0 1px rgba(0,0,0,0.1)',
                }}
              />
              <span
                style={{
                  color: textPrimary,
                  fontSize: paintTextSize,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  lineHeight: 1,
                }}
              >
                {p.name}
              </span>
            </div>
          ))}
          {extraPaints > 0 && (
            <span style={{ color: textSecondary, fontSize: paintTextSize, fontWeight: 500 }}>
              +{extraPaints}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          paddingTop: pad * 0.45,
          flex: 1,
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
            marginBottom: pad * 0.2,
            lineHeight: 1,
            flexShrink: 0,
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
              lineHeight: 1.1,
              wordBreak: 'break-word',
              marginBottom: pad * 0.3,
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
              wordBreak: 'break-word',
              marginBottom: pad * 0.3,
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
            marginTop: 'auto',
            paddingTop: pad * 0.3,
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
