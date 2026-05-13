import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Paintpile - The Community for Miniature Painters';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0c0c10 0%, #14112a 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Purple glow blob */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,.3) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        {/* Gold glow blob */}
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,.15) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <div
            style={{
              fontSize: 100,
              fontWeight: 900,
              letterSpacing: '0.06em',
              color: '#f0eeff',
              lineHeight: 1,
            }}
          >
            PAINTPILE
          </div>

          <div
            style={{
              fontSize: 32,
              color: '#a78bfa',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            The Community for Miniature Painters
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            {['4,700+ Paints', 'AI Critique', 'Free to Start'].map((label) => (
              <div
                key={label}
                style={{
                  background: 'rgba(124,58,237,.2)',
                  border: '1px solid rgba(124,58,237,.5)',
                  borderRadius: 999,
                  padding: '10px 28px',
                  fontSize: 24,
                  color: '#c4b5fd',
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
