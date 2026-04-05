// ================================================================
// CONFIGURATION
// ================================================================
export const BASE_URL = 'https://thepaintpile.com';

export const TABS = [
  { key: 'home',          label: 'Home',     icon: '🏠', path: '/feed' },
  { key: 'projects',      label: 'Projects', icon: '🎨', path: '/projects' },
  { key: 'groups',        label: 'Groups',   icon: '👥', path: '/groups' },
  { key: 'notifications', label: 'Alerts',   icon: '🔔', path: '/notifications' },
  { key: 'profile',       label: 'Profile',  icon: '👤', path: '/profile' },
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
