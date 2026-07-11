// ================================================================
// CONFIGURATION
// ================================================================
export const BASE_URL = 'https://thepaintpile.com';

// Mirrors the web app's five-hub navigation. `match` lists every web route
// that belongs to a tab so the active state follows in-page navigation.
export const TABS = [
  { key: 'home',      label: 'Home',      icon: '🏠', path: '/home',
    match: ['/home'] },
  { key: 'workshop',  label: 'Workshop',  icon: '🛠️', path: '/projects',
    match: ['/projects', '/pile', '/diary', '/dashboard', '/badges'] },
  { key: 'studio',    label: 'Studio',    icon: '🎨', path: '/paints',
    match: ['/paints', '/recipes', '/tools', '/palette-post'] },
  { key: 'community', label: 'Community', icon: '👥', path: '/feed',
    match: ['/feed', '/challenges', '/groups', '/news'] },
  { key: 'alerts',    label: 'Alerts',    icon: '🔔', path: '/notifications',
    match: ['/notifications'] },
] as const;

export type Tab = (typeof TABS)[number];

// ================================================================
// THEME — matches PaintPile web dark mode ("The Vault"):
// near-black surfaces, violet primary. `active` is the lighter
// violet the web uses for text so small labels pass AA contrast.
// ================================================================
export const C = {
  bg:       '#0c0c10',
  card:     '#16161e',
  primary:  '#7c3aed',
  border:   'rgba(255,255,255,0.07)',
  active:   '#a78bfa',
  inactive: '#7a7898',
  fg:       '#f0eeff',
} as const;
