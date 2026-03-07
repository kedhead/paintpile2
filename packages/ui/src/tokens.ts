export const colors = {
  primary: {
    50: '#f0f7ff',
    100: '#e0efff',
    200: '#b9dfff',
    300: '#7cc4ff',
    400: '#36a5ff',
    500: '#0c87f0',
    600: '#006bcd',
    700: '#0055a6',
    800: '#054989',
    900: '#0a3d71',
  },
  accent: {
    50: '#fdf4f3',
    100: '#fce8e4',
    200: '#fad5ce',
    300: '#f5b5aa',
    400: '#ee8b78',
    500: '#e2644e',
    600: '#ce4833',
    700: '#ad3926',
    800: '#8f3223',
    900: '#772e23',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
} as const;

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
} as const;

export const borderRadius = {
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  full: '9999px',
} as const;
