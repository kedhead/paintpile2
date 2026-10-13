'use client';

import Link from 'next/link';
import { ChevronRight, Crosshair, Images, Palette, Sun } from 'lucide-react';

const TOOLS = [
  {
    href: '/tools/color-matcher',
    label: 'Color Matcher',
    description: 'Find the closest paint match across brands.',
    icon: Crosshair,
    tint: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  {
    href: '/tools/paint-mixer',
    label: 'Paint Mixer',
    description: 'Mix paint ratios and preview the resulting color.',
    icon: Palette,
    tint: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  },
  {
    href: '/tools/lighting-ref',
    label: 'Lighting Reference',
    description: 'Visualize light angles and shadows for your miniatures.',
    icon: Sun,
    tint: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  {
    href: '/palette-post',
    label: 'Palette Post',
    description: 'Turn a project and its paints into an Instagram-ready carousel.',
    icon: Images,
    tint: 'bg-pink-500/15 text-pink-600 dark:text-pink-400',
  },
];

export default function ToolsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-bebas text-4xl tracking-wide text-foreground">Tools</h1>
      <p className="mb-6 text-sm text-muted-foreground">Utilities to help with your painting workflow.</p>

      <div className="grid gap-3">
        {TOOLS.map(({ href, label, description, icon: Icon, tint }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-primary/40"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${tint}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-foreground">{label}</div>
              <div className="text-sm text-muted-foreground">{description}</div>
            </div>
            <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
