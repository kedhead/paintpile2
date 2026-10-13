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
// THEME — matches the web's default light theme ("Gallery"):
// neutral surfaces so painted minis read true, one cadmium accent.
// ================================================================
export const C = {
  bg:       '#f5f5f5',
  card:     '#ffffff',
  primary:  '#bf3918',
  border:   'rgba(0,0,0,0.08)',
  active:   '#bf3918',
  inactive: '#61616b',
  fg:       '#18181b',
} as const;
