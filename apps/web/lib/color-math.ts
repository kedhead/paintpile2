// Color conversion and matching utilities

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

export function rgbToXyz(r: number, g: number, b: number): [number, number, number] {
  let rr = r / 255;
  let gg = g / 255;
  let bb = b / 255;

  rr = rr > 0.04045 ? Math.pow((rr + 0.055) / 1.055, 2.4) : rr / 12.92;
  gg = gg > 0.04045 ? Math.pow((gg + 0.055) / 1.055, 2.4) : gg / 12.92;
  bb = bb > 0.04045 ? Math.pow((bb + 0.055) / 1.055, 2.4) : bb / 12.92;

  rr *= 100;
  gg *= 100;
  bb *= 100;

  return [
    rr * 0.4124564 + gg * 0.3575761 + bb * 0.1804375,
    rr * 0.2126729 + gg * 0.7151522 + bb * 0.0721750,
    rr * 0.0193339 + gg * 0.1191920 + bb * 0.9503041,
  ];
}

export function xyzToLab(x: number, y: number, z: number): [number, number, number] {
  const refX = 95.047;
  const refY = 100.0;
  const refZ = 108.883;

  let xx = x / refX;
  let yy = y / refY;
  let zz = z / refZ;

  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);

  xx = f(xx);
  yy = f(yy);
  zz = f(zz);

  return [116 * yy - 16, 500 * (xx - yy), 200 * (yy - zz)];
}

export function hexToLab(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  const [x, y, z] = rgbToXyz(r, g, b);
  return xyzToLab(x, y, z);
}

export function deltaE76(lab1: [number, number, number], lab2: [number, number, number]): number {
  return Math.sqrt(
    Math.pow(lab1[0] - lab2[0], 2) +
    Math.pow(lab1[1] - lab2[1], 2) +
    Math.pow(lab1[2] - lab2[2], 2)
  );
}

export interface PaintMatch {
  paintId: string;
  name: string;
  brand: string;
  hex: string;
  deltaE: number;
}

export function findTopMatches(
  targetHex: string,
  paints: { id: string; name: string; brand: string; hex_color: string }[],
  n: number = 5
): PaintMatch[] {
  const targetLab = hexToLab(targetHex);

  const scored = paints
    .filter((p) => p.hex_color)
    .map((paint) => ({
      paintId: paint.id,
      name: paint.name,
      brand: paint.brand,
      hex: paint.hex_color,
      deltaE: deltaE76(targetLab, hexToLab(paint.hex_color)),
    }));

  scored.sort((a, b) => a.deltaE - b.deltaE);
  return scored.slice(0, n);
}
