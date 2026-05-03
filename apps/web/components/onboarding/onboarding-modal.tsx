'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../auth-provider';

const STORAGE_KEY = 'paintpile-onboarded';

// ── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:          '#0c0c10',
  bgAlt:       '#111118',
  surface:     '#16161e',
  surfaceHov:  '#1c1c26',
  border:      'rgba(255,255,255,.07)',
  borderStr:   'rgba(255,255,255,.14)',
  text:        '#f0eeff',
  muted:       '#7a7898',
  subtle:      '#3e3c58',
  accent:      '#7c3aed',
  accentHov:   '#6d28d9',
  accentGlow:  'rgba(124,58,237,.35)',
  accentLight: 'rgba(124,58,237,.12)',
  gold:        '#f59e0b',
  green:       '#10b981',
  pill:        'rgba(255,255,255,.06)',
  shadow:      '0 1px 3px rgba(0,0,0,.5), 0 4px 16px rgba(0,0,0,.3)',
  glow:        '0 0 24px rgba(124,58,237,.3)',
};

// ── Step dots ────────────────────────────────────────────────────────────────
function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            borderRadius: 99,
            background: i === current ? T.accent : i < current ? T.accentLight : T.subtle,
            transition: 'all .3s cubic-bezier(.4,0,.2,1)',
            boxShadow: i === current ? T.glow : 'none',
          }}
        />
      ))}
    </div>
  );
}

// ── Toggle pill ──────────────────────────────────────────────────────────────
function TogglePill({ label, emoji, selected, onClick }: {
  label: string; emoji?: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '9px 14px',
        background: selected ? T.accentLight : T.pill,
        border: `1.5px solid ${selected ? T.accent : T.border}`,
        borderRadius: 10,
        color: selected ? T.text : T.muted,
        fontFamily: 'DM Sans, sans-serif',
        fontSize: 13, fontWeight: selected ? 600 : 400,
        cursor: 'pointer', transition: 'all .15s',
        boxShadow: selected ? `0 0 14px ${T.accentGlow}` : 'none',
      }}
    >
      {emoji && <span style={{ fontSize: 15 }}>{emoji}</span>}
      {label}
      {selected && (
        <div style={{ marginLeft: 'auto', width: 16, height: 16, borderRadius: '50%', background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
      )}
    </button>
  );
}

// ── CTA Button ───────────────────────────────────────────────────────────────
function CTABtn({ children, onClick, disabled, secondary, fullWidth }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; secondary?: boolean; fullWidth?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: fullWidth ? '100%' : 'auto',
        padding: '13px 28px',
        background: disabled ? T.subtle : secondary ? T.pill : hov ? T.accentHov : T.accent,
        color: disabled ? T.muted : secondary ? T.muted : '#fff',
        border: secondary ? `1px solid ${T.border}` : 'none',
        borderRadius: 12,
        fontFamily: 'DM Sans, sans-serif',
        fontSize: 15, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: !disabled && !secondary ? (hov ? `0 0 40px ${T.accentGlow}` : T.glow) : 'none',
        transition: 'all .2s',
        letterSpacing: '.01em',
      }}
    >
      {children}
    </button>
  );
}

// ── Paint blobs background ───────────────────────────────────────────────────
function PaintBlobs() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,.18) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,.1) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', inset: 0, opacity: .025, backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// STEP SCREENS
// ══════════════════════════════════════════════════════════════════

type UserData = {
  level?: string;
  games?: string[];
  brands?: string[];
  projectName?: string;
  projectType?: string;
};

// Step 0: Welcome
function WelcomeStep({ onNext }: { onNext: () => void }) {
  const features = [
    { icon: '🎨', label: 'Track your projects',  color: T.accent },
    { icon: '📦', label: 'Manage the Pile',       color: T.gold },
    { icon: '🖌️', label: 'Catalog your paints',  color: T.green },
    { icon: '👥', label: 'Share your progress',   color: '#ec4899' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '32px 24px', position: 'relative', textAlign: 'center' }}>
      <PaintBlobs />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400 }}>
        <div className="animate-float" style={{ marginBottom: 24 }}>
          <img src="/logosmall.png" alt="Paintpile" style={{ height: 72, width: 'auto', margin: '0 auto', filter: 'drop-shadow(0 0 32px rgba(124,58,237,.6))' }} />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: '.1s' }}>
          <div style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 56, letterSpacing: '.04em', lineHeight: .95, color: T.text, marginBottom: 8 }}>
            WELCOME!
          </div>
          <div style={{ fontSize: 16, color: T.muted, lineHeight: 1.5, marginBottom: 32 }}>
            Your mini painting<br />
            <span style={{ color: T.accent, fontWeight: 600 }}>journal, community &amp; toolkit.</span>
          </div>
        </div>
        <div className="animate-fade-up" style={{ animationDelay: '.2s', marginBottom: 36 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, textAlign: 'left' }}>
            {features.map((f, i) => (
              <div
                key={f.label}
                className="animate-scale-up"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 12, padding: '11px 13px', boxShadow: T.shadow,
                  animationDelay: `${.25 + i * .05}s`,
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${f.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>
                  {f.icon}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.text, lineHeight: 1.3 }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="animate-fade-up" style={{ animationDelay: '.4s' }}>
          <CTABtn onClick={onNext} fullWidth>Get Started →</CTABtn>
        </div>
      </div>
    </div>
  );
}

// Step 1: Experience
function ExperienceStep({ onNext, onBack, data, setData }: { onNext: () => void; onBack: () => void; data: UserData; setData: (d: UserData) => void }) {
  const levels = [
    { id: 'beginner',  label: 'Just starting out',    sub: "I'm new to mini painting",     emoji: '🌱' },
    { id: 'hobbyist',  label: 'Casual hobbyist',       sub: 'I paint for fun occasionally',  emoji: '🖌️' },
    { id: 'dedicated', label: 'Dedicated painter',     sub: 'I paint regularly and improve', emoji: '🎨' },
    { id: 'veteran',   label: 'Veteran painter',       sub: 'Years of experience',           emoji: '⚔️' },
  ];
  const games = [
    { id: 'w40k',   label: 'Warhammer 40K',       emoji: '🔴' },
    { id: 'aos',    label: 'Age of Sigmar',        emoji: '⚡' },
    { id: 'warcry', label: 'Warcry / Underworlds', emoji: '🗡️' },
    { id: 'bfme',   label: 'Board Games',          emoji: '🎲' },
    { id: 'dnd',    label: 'D&D / RPGs',           emoji: '🐉' },
    { id: 'other',  label: 'Other Systems',        emoji: '✨' },
  ];
  const toggleGame = (id: string) => {
    const cur = data.games || [];
    setData({ ...data, games: cur.includes(id) ? cur.filter(g => g !== id) : [...cur, id] });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', position: 'relative' }}>
      <PaintBlobs />
      <div style={{ position: 'relative', zIndex: 1, padding: '28px 24px 40px', maxWidth: 480, width: '100%', margin: '0 auto' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13, marginBottom: 24, padding: 0 }}>
          ← Back
        </button>
        <div style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 40, letterSpacing: '.03em', color: T.text, lineHeight: 1, marginBottom: 4 }}>YOUR EXPERIENCE</div>
        <div style={{ fontSize: 14, color: T.muted, marginBottom: 24 }}>We'll tailor your experience to your level</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
          {levels.map(l => (
            <button key={l.id} onClick={() => setData({ ...data, level: l.id })} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px',
              background: data.level === l.id ? T.accentLight : T.surface,
              border: `1.5px solid ${data.level === l.id ? T.accent : T.border}`,
              borderRadius: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textAlign: 'left',
              transition: 'all .15s', boxShadow: data.level === l.id ? `0 0 20px ${T.accentGlow}` : T.shadow,
            }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{l.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{l.label}</div>
                <div style={{ fontSize: 12, color: T.muted }}>{l.sub}</div>
              </div>
              {data.level === l.id && (
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
              )}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: T.muted, marginBottom: 12 }}>What do you paint for?</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 28 }}>
          {games.map(g => (
            <TogglePill key={g.id} label={g.label} emoji={g.emoji} selected={(data.games || []).includes(g.id)} onClick={() => toggleGame(g.id)} />
          ))}
        </div>
        <CTABtn onClick={onNext} disabled={!data.level} fullWidth>Continue →</CTABtn>
      </div>
    </div>
  );
}

// Step 2: Paint Brands
function BrandsStep({ onNext, onBack, data, setData }: { onNext: () => void; onBack: () => void; data: UserData; setData: (d: UserData) => void }) {
  const brands = [
    { id: 'citadel',   label: 'Citadel',          sub: 'Games Workshop',         swatch: ['#1a1a1a', '#8c1a1a', '#1a3a7a', '#3a5c2a'] },
    { id: 'vallejo',   label: 'Vallejo',           sub: 'Model Color / Game',     swatch: ['#c8941a', '#6a3818', '#1e6ea6', '#5c3a2a'] },
    { id: 'army',      label: 'The Army Painter',  sub: 'Warpaints / Speedpaint', swatch: ['#8b4513', '#2d4a1a', '#4a1a3a', '#1a4a4a'] },
    { id: 'privateer', label: 'P3 / Privateer',    sub: 'Warmachine range',       swatch: ['#2a1a4a', '#4a2a0a', '#0a2a2a', '#2a2a0a'] },
    { id: 'scale75',   label: 'Scale75',           sub: 'Artist quality',         swatch: ['#5a3a1a', '#1a1a3a', '#1a3a1a', '#3a1a1a'] },
    { id: 'ak',        label: 'AK Interactive',    sub: 'Weathering & terrain',   swatch: ['#3a2a1a', '#1a2a3a', '#2a3a1a', '#3a1a2a'] },
  ];
  const toggle = (id: string) => {
    const cur = data.brands || [];
    setData({ ...data, brands: cur.includes(id) ? cur.filter(b => b !== id) : [...cur, id] });
  };
  const count = (data.brands || []).length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', position: 'relative' }}>
      <PaintBlobs />
      <div style={{ position: 'relative', zIndex: 1, padding: '28px 24px 40px', maxWidth: 480, width: '100%', margin: '0 auto' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13, marginBottom: 24, padding: 0 }}>
          ← Back
        </button>
        <div style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 40, letterSpacing: '.03em', color: T.text, lineHeight: 1, marginBottom: 4 }}>YOUR PAINT BRANDS</div>
        <div style={{ fontSize: 14, color: T.muted, marginBottom: 24 }}>Select the brands you own or want to track</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
          {brands.map(b => {
            const sel = (data.brands || []).includes(b.id);
            return (
              <button key={b.id} onClick={() => toggle(b.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                background: sel ? T.accentLight : T.surface, border: `1.5px solid ${sel ? T.accent : T.border}`,
                borderRadius: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textAlign: 'left',
                transition: 'all .15s', boxShadow: sel ? `0 0 16px ${T.accentGlow}` : T.shadow,
              }}>
                <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                  {b.swatch.map((c, i) => <div key={i} style={{ width: 14, height: 28, borderRadius: 4, background: c }} />)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{b.label}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>{b.sub}</div>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: sel ? T.accent : T.pill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: sel ? 'none' : `1px solid ${T.border}`, transition: 'all .15s' }}>
                  {sel && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                </div>
              </button>
            );
          })}
        </div>
        <CTABtn onClick={onNext} fullWidth>
          {count > 0 ? `Continue with ${count} brand${count > 1 ? 's' : ''}` : 'Skip for now'} →
        </CTABtn>
      </div>
    </div>
  );
}

// Step 3: First Project
function ProjectStep({ onNext, onBack, data, setData }: { onNext: () => void; onBack: () => void; data: UserData; setData: (d: UserData) => void }) {
  const [focused, setFocused] = useState('');
  const templates = [
    { id: 'squad',   label: 'Painting a squad',  sub: '5-10 infantry models', emoji: '⚔️' },
    { id: 'hero',    label: 'Showcase model',     sub: 'A hero or character',  emoji: '🏆' },
    { id: 'warband', label: 'Warband / gang',     sub: '10-20 models',         emoji: '🛡️' },
    { id: 'army',    label: 'Full army',          sub: 'Large scale project',  emoji: '⚡' },
    { id: 'custom',  label: 'Something else',     sub: "I'll define my own",   emoji: '✨' },
  ];
  const isFocused = focused === 'name';
  const hasInput = !!(data.projectName || data.projectType);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', position: 'relative' }}>
      <PaintBlobs />
      <div style={{ position: 'relative', zIndex: 1, padding: '28px 24px 40px', maxWidth: 480, width: '100%', margin: '0 auto' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13, marginBottom: 24, padding: 0 }}>
          ← Back
        </button>
        <div style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 38, letterSpacing: '.03em', color: T.text, lineHeight: 1, marginBottom: 4 }}>START YOUR FIRST PROJECT</div>
        <div style={{ fontSize: 14, color: T.muted, marginBottom: 24 }}>What are you painting? You can always add more later.</div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: T.muted, display: 'block', marginBottom: 6 }}>Project Name</label>
          <input
            value={data.projectName || ''}
            onChange={e => setData({ ...data, projectName: e.target.value })}
            onFocus={() => setFocused('name')}
            onBlur={() => setFocused('')}
            placeholder="e.g. Dark Angels 3rd Company"
            style={{
              width: '100%', padding: '12px 14px',
              background: isFocused ? T.surfaceHov : T.bgAlt,
              border: `1.5px solid ${isFocused ? T.accent : T.border}`,
              borderRadius: 10, color: T.text, fontSize: 14, outline: 'none',
              fontFamily: 'DM Sans, sans-serif', transition: 'all .15s',
              boxShadow: isFocused ? `0 0 0 3px ${T.accentLight}` : 'none',
            }}
          />
        </div>
        <div style={{ marginBottom: 28 }}>
          <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: T.muted, display: 'block', marginBottom: 10 }}>What type?</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
            {templates.map(tmpl => (
              <button key={tmpl.id} onClick={() => setData({ ...data, projectType: tmpl.id })} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '10px 12px',
                background: data.projectType === tmpl.id ? T.accentLight : T.surface,
                border: `1.5px solid ${data.projectType === tmpl.id ? T.accent : T.border}`,
                borderRadius: 10, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textAlign: 'left', transition: 'all .15s',
              }}>
                <span style={{ fontSize: 18, marginBottom: 5 }}>{tmpl.emoji}</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{tmpl.label}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{tmpl.sub}</div>
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <CTABtn onClick={onNext} disabled={!hasInput} fullWidth>
            {hasInput ? 'Continue →' : 'Skip for now'}
          </CTABtn>
          {!hasInput && (
            <button onClick={onNext} style={{ background: 'none', border: 'none', color: T.muted, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              Skip — I&apos;ll set up later
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step 4: All set!
function SuccessStep({ data, onFinish }: { data: UserData; onFinish: () => void }) {
  const swatches = ['#1a1a1a', '#8c1a1a', '#1a3a7a', '#3a5c2a', '#8a6a1a', '#c84a7a', '#7a7a8a', '#6a3818', '#2d7a44', '#c8941a', '#1e6ea6', '#8b4513'];
  const levelLabels: Record<string, string> = { beginner: 'Just starting out', hobbyist: 'Casual hobbyist', dedicated: 'Dedicated painter', veteran: 'Veteran painter' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '32px 24px', position: 'relative', textAlign: 'center' }}>
      <PaintBlobs />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400 }}>
        <div className="animate-fade-up" style={{ marginBottom: 24 }}>
          <div className="animate-pulse-glow" style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto', background: `linear-gradient(135deg, ${T.accent}, #4f46e5)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 48px ${T.accentGlow}` }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
        </div>
        <div className="animate-fade-up" style={{ animationDelay: '.1s' }}>
          <div style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 48, letterSpacing: '.03em', color: T.text, lineHeight: 1, marginBottom: 8 }}>YOU&apos;RE ALL SET!</div>
          <div style={{ fontSize: 16, color: T.muted, marginBottom: 8, lineHeight: 1.6 }}>
            Welcome to Paintpile,{' '}
            <span style={{ color: T.accent, fontWeight: 600 }}>fellow painter.</span>
          </div>
        </div>
        <div className="animate-fade-up" style={{
          animationDelay: '.15s', background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 14, padding: 16, marginBottom: 28, textAlign: 'left', boxShadow: T.shadow,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: T.subtle, marginBottom: 12 }}>YOUR SETUP</div>
          {[
            { label: 'Experience', val: levelLabels[data.level || ''] || 'Hobbyist' },
            { label: 'Systems',    val: data.games?.length ? `${data.games.length} game system${data.games.length > 1 ? 's' : ''}` : 'Not set' },
            { label: 'Brands',     val: data.brands?.length ? `${data.brands.length} brand${data.brands.length > 1 ? 's' : ''}` : 'Not set' },
            { label: 'Project',    val: data.projectName || 'Not set' },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: T.muted, width: 90, flexShrink: 0 }}>{row.label}</span>
              <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{row.val}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, display: 'flex', borderRadius: 8, overflow: 'hidden', height: 10, gap: 1 }}>
            {swatches.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
          </div>
        </div>
        <div className="animate-fade-up" style={{ animationDelay: '.25s' }}>
          <CTABtn onClick={onFinish} fullWidth>Enter Paintpile →</CTABtn>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ROOT ONBOARDING
// ══════════════════════════════════════════════════════════════════
const STEPS = ['welcome', 'experience', 'brands', 'project', 'success'] as const;
const TOTAL_DOTS = 4; // steps 1-4 show dots

export function OnboardingModal() {
  const { user, pb } = useAuth();
  const [show, setShow] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [userData, setUserData] = useState<UserData>({});

  useEffect(() => {
    if (!user) return;
    const done = localStorage.getItem(`${STORAGE_KEY}-${user.id}`);
    if (!done) setShow(true);
  }, [user]);

  const finish = () => {
    if (user) {
      localStorage.setItem(`${STORAGE_KEY}-${user.id}`, 'true');
      // Persist non-critical prefs to localStorage
      localStorage.setItem(`paintpile-prefs-${user.id}`, JSON.stringify(userData));
    }
    setShow(false);
  };

  if (!show || !user) return null;

  const step = STEPS[stepIdx];
  const next = () => { if (stepIdx < STEPS.length - 1) setStepIdx(s => s + 1); };
  const back = () => { if (stepIdx > 0) setStepIdx(s => s - 1); };
  const showDots = stepIdx >= 1 && stepIdx <= 4;
  const dotStep = stepIdx - 1;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0c0c10', color: '#f0eeff', display: 'flex', flexDirection: 'column', fontFamily: 'DM Sans, sans-serif', overflow: 'hidden' }}>
      {/* Progress header */}
      {showDots && (
        <div style={{
          padding: '16px 24px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, position: 'sticky', top: 0, background: '#0c0c10', zIndex: 10,
          borderBottom: '1px solid rgba(255,255,255,.05)',
        }}>
          <img src="/logosmall.png" alt="Paintpile" style={{ height: 26, width: 'auto', opacity: .7 }} />
          <StepDots total={TOTAL_DOTS} current={dotStep} />
          <div style={{ fontSize: 11, color: '#7a7898', fontFamily: '"DM Mono", monospace', letterSpacing: '.06em' }}>
            {dotStep + 1}/{TOTAL_DOTS}
          </div>
        </div>
      )}

      {/* Step content (scrollable) */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {step === 'welcome'    && <WelcomeStep    onNext={next} />}
        {step === 'experience' && <ExperienceStep onNext={next} onBack={back} data={userData} setData={setUserData} />}
        {step === 'brands'     && <BrandsStep     onNext={next} onBack={back} data={userData} setData={setUserData} />}
        {step === 'project'    && <ProjectStep    onNext={next} onBack={back} data={userData} setData={setUserData} />}
        {step === 'success'    && <SuccessStep    data={userData} onFinish={finish} />}
      </div>
    </div>
  );
}
