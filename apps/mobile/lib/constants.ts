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
// THEME — matches PaintPile web dark mode
// ================================================================
export const C = {
  bg:       '#140A18',
  card:     '#1F1422',
  primary:  '#FA4FD1',
  border:   '#29383A',
  active:   '#FA4FD1',
  inactive: '#8A849A',
  fg:       '#F0F0F0',
} as const;
