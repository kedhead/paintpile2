# Paintpile Design System — "The Vault"

## Overview
Dark, immersive aesthetic built for miniature painters working in low-light environments.
Neon-purple primary accent on a near-black foundation. Gold secondary for achievement/status.

## Colors

| Token | Value | Usage |
|---|---|---|
| background | #0c0c10 | Page background |
| surface | #16161e | Cards, modals, panels |
| surface-alt | #111118 | Inputs, secondary surfaces |
| surface-raised | #1c1c26 | Hover states, elevated cards |
| border | rgba(255,255,255,.07) | Subtle borders |
| border-strong | rgba(255,255,255,.14) | Focused/active borders |
| text | #f0eeff | Primary text |
| text-muted | #7a7898 | Secondary/helper text |
| text-subtle | #3e3c58 | Placeholder, disabled |
| primary | #7c3aed | Interactive elements, CTAs, focus rings |
| primary-hover | #6d28d9 | Hover state for primary |
| primary-glow | rgba(124,58,237,.3) | Box shadows on primary elements |
| primary-light | rgba(124,58,237,.12) | Tinted backgrounds |
| gold | #f59e0b | Achievements, Pro badge, secondary accent |
| green | #10b981 | Success, completed status |
| red | #ef4444 | Error, destructive actions |
| pink | #ec4899 | Social/sharing accent |

## Typography

| Role | Family | Weight | Size |
|---|---|---|---|
| Display / headings | Bebas Neue | 400 | 32–96px, letter-spacing .04–.06em |
| Body | DM Sans | 400–700 | 12–18px |
| Mono / code | DM Mono | 400–500 | 12–14px |

All fonts loaded from Google Fonts. `font-bebas` Tailwind utility maps to Bebas Neue.

## Layout

- Max content width: `max-w-2xl` (feed), `max-w-3xl` (dashboard), `max-w-5xl` (grids)
- Sidebar width: 200px expanded / 56px collapsed
- Mobile bottom nav height: 60px
- Header height: 52px (sticky)
- Base spacing unit: 4px (Tailwind default)

## Elevation / Shadows

| Level | Value |
|---|---|
| Card | `0 1px 3px rgba(0,0,0,.5), 0 4px 16px rgba(0,0,0,.3)` |
| Modal | `0 8px 40px rgba(0,0,0,.6)` |
| Glow (primary) | `0 0 24px rgba(124,58,237,.3)` |
| Glow (strong) | `0 0 40px rgba(124,58,237,.4)` |

## Shapes / Border Radius

| Usage | Value |
|---|---|
| Cards, modals | 12–16px (`rounded-xl`, `rounded-2xl`) |
| Buttons | 10–12px (`rounded-xl`) |
| Inputs | 8–10px |
| Pills / tags | 999px (`rounded-full`) |
| Small icons | 6–8px (`rounded-lg`) |

## Components

### Button (Primary)
- Background: `#7c3aed`
- Text: white, 14px, bold
- Border-radius: 12px
- Box-shadow: `0 0 24px rgba(124,58,237,.3)`
- Hover: background `#6d28d9`

### Button (Secondary / Ghost)
- Background: transparent
- Border: `1px solid rgba(255,255,255,.1)`
- Text: `#f0eeff`
- Hover: background `rgba(255,255,255,.05)`

### Card
- Background: `#16161e`
- Border: `1px solid rgba(255,255,255,.07)`
- Border-radius: 16px
- Hover: border `rgba(255,255,255,.12)`

### Input
- Background: `#111118` (focused: `#1c1c26`)
- Border: `1.5px solid rgba(255,255,255,.07)` (focused: `#7c3aed`)
- Focus ring: `0 0 0 3px rgba(124,58,237,.12)`
- Text: `#f0eeff`, 14px, DM Sans

### Badge (Pro)
- Background: `rgba(245,158,11,.15)`
- Text: `#f59e0b`, 12px, semibold
- Border-radius: 999px

## Background Decorations
Ambient radial gradient blobs are used on key screens (landing, auth pages):
- Purple blob: `radial-gradient(circle, rgba(124,58,237,.15) 0%, transparent 65%)`
- Gold blob: `radial-gradient(circle, rgba(245,158,11,.08) 0%, transparent 65%)`
- Grid overlay: `rgba(255,255,255,.02)` at 40px intervals

## Tailwind Config Notes
Custom tokens: `vault.*` color scale, `font-bebas` font family, `animate-float`, `animate-fade-up`, `animate-scale-up` keyframes defined in `apps/web/tailwind.config.ts` and `apps/web/app/globals.css`.
