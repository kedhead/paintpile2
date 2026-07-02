import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
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
          hover: '#6d28d9',
          tint: '#a78bfa',
          soft: 'rgba(124,58,237,.12)',
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
        surface: {
          DEFAULT: '#16161e',
          alt:     '#111118',
          raised:  '#1c1c26',
          deep:    '#0e0e16',
        },
        ink: {
          DEFAULT: '#f0eeff',
          muted:   '#7a7898',
          subtle:  '#3e3c58',
        },
        edge: {
          DEFAULT: 'rgba(255,255,255,.07)',
          strong:  'rgba(255,255,255,.14)',
        },
        gold: {
          DEFAULT: '#f59e0b',
          soft:    'rgba(245,158,11,.15)',
        },
        success: '#10b981',
        social:  '#ec4899',
        danger:  '#ef4444',
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
      backgroundImage: {
        'vault-blob-purple': 'radial-gradient(circle, rgba(124,58,237,.15) 0%, transparent 65%)',
        'vault-blob-gold': 'radial-gradient(circle, rgba(245,158,11,.08) 0%, transparent 65%)',
      },
    },
  },
  plugins: [],
};

export default config;
