import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/web/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        neon: {
          green: 'hsl(var(--neon-green))',
          blue: 'hsl(var(--neon-blue))',
          orange: 'hsl(var(--neon-orange))',
          pink: 'hsl(var(--neon-pink))',
        },
        vault: {
          bg:      '#09091a',
          surface: '#181726',
          accent:  '#7c3aed',
          gold:    '#f59e0b',
          green:   '#10b981',
        },
      },
      fontFamily: {
        bebas:    ['"Bebas Neue"', 'cursive'],
        'dm-sans': ['"DM Sans"', 'sans-serif'],
        'dm-mono': ['"DM Mono"', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'glow-violet': '0 0 24px rgba(124, 58, 237, 0.3)',
        'glow-violet-lg': '0 0 40px rgba(124, 58, 237, 0.4)',
        'glow-gold': '0 0 24px rgba(245, 158, 11, 0.3)',
        'vault': '0 1px 3px rgba(0,0,0,.5), 0 4px 16px rgba(0,0,0,.3)',
        'vault-lg': '0 8px 40px rgba(0,0,0,.6)',
      },
    },
  },
  plugins: [],
};

export default config;
