export interface CardTheme {
  key: string;
  label: string;
  bg: string;
  textColor: string;
  accentColor: string;
  borderStyle: string;
  fontFamily: string;
  secondaryText: string;
}

export const CARD_THEMES: Record<string, CardTheme> = {
  dark: {
    key: 'dark',
    label: 'Dark',
    bg: '#14111e',
    textColor: '#ffffff',
    accentColor: '#a78bfa',
    borderStyle: '1px solid #2d2640',
    fontFamily: "'Inter', sans-serif",
    secondaryText: '#9ca3af',
  },
  light: {
    key: 'light',
    label: 'Light',
    bg: '#ffffff',
    textColor: '#111827',
    accentColor: '#7c3aed',
    borderStyle: '1px solid #e5e7eb',
    fontFamily: "'Inter', sans-serif",
    secondaryText: '#6b7280',
  },
  gradient: {
    key: 'gradient',
    label: 'Gradient',
    bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
    textColor: '#ffffff',
    accentColor: '#c4b5fd',
    borderStyle: '1px solid #4338ca',
    fontFamily: "'Inter', sans-serif",
    secondaryText: '#a5b4fc',
  },
  minimal: {
    key: 'minimal',
    label: 'Minimal',
    bg: '#fafafa',
    textColor: '#171717',
    accentColor: '#525252',
    borderStyle: 'none',
    fontFamily: "'Inter', sans-serif",
    secondaryText: '#737373',
  },
  neon: {
    key: 'neon',
    label: 'Neon',
    bg: '#0a0a0a',
    textColor: '#39ff14',
    accentColor: '#ff6ec7',
    borderStyle: '1px solid #39ff14',
    fontFamily: "'Inter', sans-serif",
    secondaryText: '#00ffff',
  },
  vintage: {
    key: 'vintage',
    label: 'Vintage',
    bg: '#fdf6e3',
    textColor: '#5c4b37',
    accentColor: '#b58900',
    borderStyle: '2px solid #d4a574',
    fontFamily: "'Georgia', serif",
    secondaryText: '#8b7355',
  },
  clean: {
    key: 'clean',
    label: 'Clean',
    bg: '#f8fafc',
    textColor: '#0f172a',
    accentColor: '#3b82f6',
    borderStyle: '1px solid #e2e8f0',
    fontFamily: "'Inter', sans-serif",
    secondaryText: '#64748b',
  },
  midnight: {
    key: 'midnight',
    label: 'Midnight',
    bg: 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    textColor: '#e2e8f0',
    accentColor: '#f472b6',
    borderStyle: '1px solid #4a4580',
    fontFamily: "'Inter', sans-serif",
    secondaryText: '#94a3b8',
  },
};

export function getTheme(key: string): CardTheme {
  return CARD_THEMES[key] || CARD_THEMES.dark;
}
