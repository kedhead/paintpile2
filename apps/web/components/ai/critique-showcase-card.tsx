'use client';

import { CheckCircle } from 'lucide-react';

interface CritiqueData {
  score: number;
  grade: string;
  analysis: string;
  colors: string;
  technical_strengths: string[];
  improvements: string[];
  createdAt: string;
}

interface CritiqueShowcaseCardProps {
  cardId: string;
  projectName: string;
  critique: CritiqueData;
  imageUrl?: string | null;
}

const GRADE_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  S: { bg: '#78350f', text: '#fde68a', border: '#d97706', glow: '#d9770640' },
  A: { bg: '#14532d', text: '#86efac', border: '#22c55e', glow: '#22c55e40' },
  B: { bg: '#1e3a5f', text: '#93c5fd', border: '#3b82f6', glow: '#3b82f640' },
  C: { bg: '#374151', text: '#d1d5db', border: '#6b7280', glow: '#6b728040' },
  D: { bg: '#431407', text: '#fdba74', border: '#f97316', glow: '#f9731640' },
  F: { bg: '#450a0a', text: '#fca5a5', border: '#ef4444', glow: '#ef444440' },
};

const SCORE_STROKE: Record<string, string> = {
  S: '#d97706',
  A: '#22c55e',
  B: '#3b82f6',
  C: '#6b7280',
  D: '#f97316',
  F: '#ef4444',
};

export function CritiqueShowcaseCard({ cardId, projectName, critique, imageUrl }: CritiqueShowcaseCardProps) {
  const grade = critique.grade || 'C';
  const colors = GRADE_COLORS[grade] || GRADE_COLORS.C;
  const strokeColor = SCORE_STROKE[grade] || '#6b7280';
  const strengths = (critique.technical_strengths || []).slice(0, 3);

  return (
    <div
      id={cardId}
      style={{ width: 1200, height: 630, fontFamily: 'system-ui, sans-serif' }}
      className="relative flex overflow-hidden bg-[#14111e]"
    >
      {/* Left: Cover photo */}
      {imageUrl ? (
        <div style={{ width: 480, flexShrink: 0 }} className="relative">
          <img
            src={imageUrl}
            alt=""
            crossOrigin="anonymous"
            style={{ width: 480, height: 630, objectFit: 'cover', display: 'block' }}
          />
          {/* Gradient overlay on right edge for blending */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, transparent 60%, #14111e 100%)',
            }}
          />
        </div>
      ) : (
        <div
          style={{ width: 480, flexShrink: 0, background: '#1e1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span style={{ color: '#4b5563', fontSize: 48 }}>🎨</span>
        </div>
      )}

      {/* Right: Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 48px 36px 40px' }}>

        {/* Top: Label + project name */}
        <div>
          <p style={{ color: '#7c3aed', fontSize: 13, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>
            AI CRITIQUE
          </p>
          <h1 style={{ color: '#f9fafb', fontSize: 32, fontWeight: 800, lineHeight: 1.2, margin: 0, wordBreak: 'break-word' }}>
            {projectName}
          </h1>
        </div>

        {/* Center: Grade + Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {/* Score ring */}
          <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
            <svg width="100" height="100" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#2d2b3d"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={strokeColor}
                strokeWidth="3"
                strokeDasharray={`${critique.score}, 100`}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#f9fafb', fontSize: 20, fontWeight: 800 }}>{critique.score}</span>
            </div>
          </div>

          {/* Grade badge */}
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 16,
              background: colors.bg,
              border: `2px solid ${colors.border}`,
              boxShadow: `0 0 32px ${colors.glow}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: colors.text, fontSize: 44, fontWeight: 900, lineHeight: 1 }}>{grade}</span>
          </div>

          {/* Brief analysis */}
          {critique.analysis && (
            <p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.6, margin: 0, flex: 1 }}>
              {critique.analysis.length > 180 ? critique.analysis.slice(0, 180) + '…' : critique.analysis}
            </p>
          )}
        </div>

        {/* Strengths */}
        {strengths.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {strengths.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ color: '#22c55e', fontSize: 14, marginTop: 1, flexShrink: 0 }}>✓</span>
                <span style={{ color: '#d1d5db', fontSize: 14, lineHeight: 1.4 }}>
                  {s.length > 90 ? s.slice(0, 90) + '…' : s}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Bottom branding */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ color: '#4b5563', fontSize: 13, margin: 0 }}>thepaintpile.com</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed' }} />
            <span style={{ color: '#6b7280', fontSize: 12 }}>Paintpile AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
