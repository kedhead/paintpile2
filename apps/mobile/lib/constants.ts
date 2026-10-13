// ================================================================
// CONFIGURATION
// ================================================================
export const BASE_URL = 'https://thepaintpile.com';

// Mirrors the web app's navigation. `match` lists every web route that
// belongs to a tab so the active state follows in-page navigation; '/' only
// matches the gallery itself, and the first matching tab wins.
export const TABS = [
  { key: 'explore',   label: 'Explore',   icon: '🖼️', path: '/',
    match: ['/', '/projects/', '/painters'] },
  { key: 'posts',     label: 'Posts',     icon: '💬', path: '/feed',
    match: ['/feed', '/challenges', '/news'] },
  { key: 'paints',    label: 'Paints',    icon: '🎨', path: '/paints',
    match: ['/paints'] },
  { key: 'workshop',  label: 'Workshop',  icon: '🛠️', path: '/home',
    match: ['/home', '/projects', '/pile', '/recipes', '/tools', '/diary', '/palette-post', '/dashboard', '/badges'] },
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
