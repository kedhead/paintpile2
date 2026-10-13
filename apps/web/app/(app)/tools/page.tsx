'use client';

import Link from 'next/link';
import { Sun, Crosshair, Palette } from 'lucide-react';

const TOOLS = [
  {
    href: '/tools/lighting-ref',
    label: 'Lighting Reference',
    description: 'Visualize light angles and shadows for your miniatures.',
    icon: Sun,
    color: '#f59e0b',
  },
  {
    href: '/tools/color-matcher',
    label: 'Color Matcher',
    description: 'Find the closest paint match across brands.',
    icon: Crosshair,
    color: '#10b981',
  },
  {
    href: '/tools/paint-mixer',
    label: 'Paint Mixer',
    description: 'Mix paint ratios and preview the resulting color.',
    icon: Palette,
    color: '#7c3aed',
  },
];

export default function ToolsPage() {
  return (
    <div className="max-w-2xl">
      <h1
        style={{
          fontFamily: '"Bebas Neue", cursive',
          fontSize: 32,
          letterSpacing: '.06em',
          color: '#f0eeff',
          marginBottom: 8,
        }}
      >
        TOOLS
      </h1>
      <p style={{ color: 'rgba(122,120,152,1)', fontSize: 14, marginBottom: 24 }}>
        Utilities to help with your painting workflow.
      </p>

      <div style={{ display: 'grid', gap: 12 }}>
        {TOOLS.map(({ href, label, description, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '16px 20px',
              background: '#16161e',
              border: '1px solid rgba(255,255,255,.07)',
              borderRadius: 12,
              textDecoration: 'none',
              transition: 'border-color .15s, box-shadow .15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = `${color}40`;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${color}18`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.07)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: `${color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon style={{ width: 22, height: 22, color } as React.CSSProperties} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#f0eeff', marginBottom: 3 }}>
                {label}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(122,120,152,1)' }}>{description}</div>
            </div>
            <div style={{ marginLeft: 'auto', color: 'rgba(122,120,152,.5)', fontSize: 18 }}>›</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
