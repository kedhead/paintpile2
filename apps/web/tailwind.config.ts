import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/web/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
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
      },
    },
  },
  plugins: [],
};

export default config;
