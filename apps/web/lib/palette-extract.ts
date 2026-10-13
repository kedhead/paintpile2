import sharp from 'sharp';
import { deltaE76, hexToLab } from './color-math';
import { nameColor, type Swatch } from './project-details';

type Lab = [number, number, number];
const SIZE = 72;

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Pull the painted colors out of a miniature photo: drop the backdrop (the
 * color that dominates the image border), cluster what's left with k-means,
 * and name each cluster with a painter-friendly color name.
 */
export async function extractColorScheme(image: Buffer, max = 5): Promise<Swatch[]> {
  const { data } = await sharp(image)
    .rotate()
    .resize(SIZE, SIZE, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels: { rgb: [number, number, number]; lab: Lab; border: boolean }[] = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = (y * SIZE + x) * 3;
      const rgb: [number, number, number] = [data[i], data[i + 1], data[i + 2]];
      const edge = Math.min(x, y, SIZE - 1 - x, SIZE - 1 - y) < 4;
      pixels.push({ rgb, lab: hexToLab(toHex(...rgb)), border: edge });
    }
  }

  // Backdrop = average of border pixels; anything close to it is background.
  const border = pixels.filter((p) => p.border);
  const bg: Lab = [0, 1, 2].map((k) => border.reduce((s, p) => s + p.lab[k], 0) / border.length) as Lab;
  const subject = pixels.filter((p) => deltaE76(p.lab, bg) > 14);
  if (subject.length < 50) return [];

  // k-means in Lab space, deterministic seeding spread across the pixel list.
  const k = Math.min(8, subject.length);
  let centers: Lab[] = Array.from({ length: k }, (_, i) => subject[Math.floor((i * subject.length) / k)].lab);
  let assign = new Array<number>(subject.length).fill(0);
  for (let iter = 0; iter < 12; iter++) {
    assign = subject.map((p) => {
      let best = 0;
      let bestD = Infinity;
      centers.forEach((c, ci) => {
        const d = deltaE76(p.lab, c);
        if (d < bestD) { bestD = d; best = ci; }
      });
      return best;
    });
    centers = centers.map((c, ci) => {
      const members = subject.filter((_, pi) => assign[pi] === ci);
      if (!members.length) return c;
      return [0, 1, 2].map((d) => members.reduce((s, m) => s + m.lab[d], 0) / members.length) as Lab;
    });
  }

  const clusters = centers
    .map((_, ci) => {
      const members = subject.filter((_, pi) => assign[pi] === ci);
      if (!members.length) return null;
      const avg = [0, 1, 2].map((d) => members.reduce((s, m) => s + m.rgb[d], 0) / members.length);
      const hex = toHex(avg[0], avg[1], avg[2]);
      return { hex, name: nameColor(hex), share: members.length / subject.length };
    })
    .filter((c): c is { hex: string; name: string; share: number } => !!c && c.share >= 0.04)
    .sort((a, b) => b.share - a.share);

  // One swatch per color name, biggest first.
  const seen = new Set<string>();
  const scheme: Swatch[] = [];
  for (const c of clusters) {
    if (seen.has(c.name)) continue;
    seen.add(c.name);
    scheme.push({ name: c.name, hex: c.hex });
    if (scheme.length >= max) break;
  }
  return scheme;
}
