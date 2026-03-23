import type { PalettePostPaint } from './palette-post-types';

export function generateCaption(paints: PalettePostPaint[], title?: string): string {
  const lines: string[] = [];

  if (title) {
    lines.push(title);
    lines.push('');
  }

  // Paint list grouped by brand
  const byBrand: Record<string, string[]> = {};
  for (const p of paints) {
    const brand = p.brand || 'Other';
    if (!byBrand[brand]) byBrand[brand] = [];
    byBrand[brand].push(p.name);
  }

  for (const [brand, names] of Object.entries(byBrand)) {
    lines.push(`${brand}: ${names.join(', ')}`);
  }

  lines.push('');
  lines.push('#minipainting #paintpile #warhammer #miniatures #painting #hobby');

  return lines.join('\n');
}
