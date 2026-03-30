/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#006bcd',
          50: '#e6f0ff',
          100: '#b3d4ff',
          200: '#80b8ff',
          300: '#4d9cff',
          400: '#1a80ff',
          500: '#006bcd',
          600: '#0055a3',
          700: '#004080',
          800: '#002a5c',
          900: '#001538',
        },
        accent: {
          DEFAULT: '#ce4833',
          500: '#ce4833',
        },
        background: '#0a0a0a',
        card: '#141414',
        border: '#2a2a2a',
        foreground: '#fafafa',
        'muted-foreground': '#a1a1aa',
      },
    },
  },
  plugins: [],
};
