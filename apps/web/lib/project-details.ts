// Structured "showcase" metadata for projects. Values are stored as plain
// strings so the vocab can grow without a schema change; labels live here.
import { deltaE76, hexToLab } from './color-math';

export interface Option { id: string; label: string }

export const KINDS: Option[] = [
  { id: 'miniature', label: 'Miniature' },
  { id: 'bust', label: 'Bust' },
  { id: 'vehicle', label: 'Vehicle' },
  { id: 'monster', label: 'Monster' },
  { id: 'terrain', label: 'Terrain' },
  { id: 'diorama', label: 'Diorama' },
  { id: 'squad', label: 'Squad / Unit' },
];

export const SOURCES: Option[] = [
  { id: 'official', label: 'Official kit' },
  { id: '3d-printed', label: '3D printed' },
  { id: 'kitbash', label: 'Kitbash' },
  { id: 'scratchbuilt', label: 'Scratchbuilt' },
];

export const STYLES: Option[] = [
  { id: 'grimdark', label: 'Grimdark' },
  { id: 'whimdark', label: 'Whimdark' },
  { id: 'classic', label: 'Classic / Heavy metal' },
  { id: 'comic', label: 'Comic / Cel-shaded' },
  { id: 'realistic', label: 'Realistic' },
  { id: 'tabletop', label: 'Tabletop standard' },
  { id: 'display', label: 'Display / Competition' },
];

export const TECHNIQUES: Option[] = [
  { id: 'layering', label: 'Layering' },
  { id: 'glazing', label: 'Glazing' },
  { id: 'wet-blending', label: 'Wet blending' },
  { id: 'drybrushing', label: 'Drybrushing' },
  { id: 'edge-highlighting', label: 'Edge highlighting' },
  { id: 'stippling', label: 'Stippling' },
  { id: 'contrast', label: 'Contrast / Speedpaint' },
  { id: 'airbrush', label: 'Airbrush' },
  { id: 'zenithal', label: 'Zenithal prime' },
  { id: 'nmm', label: 'NMM' },
  { id: 'osl', label: 'OSL' },
  { id: 'freehand', label: 'Freehand' },
  { id: 'weathering', label: 'Weathering' },
  { id: 'basing', label: 'Basing' },
];

export function labelFor(options: Option[], id: unknown): string | null {
  if (typeof id !== 'string' || !id) return null;
  return options.find((o) => o.id === id)?.label ?? null;
}

export function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

// ── Color scheme ─────────────────────────────────────────────────────────────

export interface Swatch { name: string; hex: string }

/** Painter-friendly color names; a detected color takes the nearest one. */
const NAMED_COLORS: Swatch[] = [
  { name: 'Bone White', hex: '#e8dcc0' }, { name: 'Pale Grey', hex: '#c8c8c8' },
  { name: 'Steel Grey', hex: '#7c8288' }, { name: 'Charcoal', hex: '#3a3a3e' },
  { name: 'Black', hex: '#141416' }, { name: 'Pure White', hex: '#f6f6f4' },
  { name: 'Blood Red', hex: '#8e1418' }, { name: 'Bright Red', hex: '#d42a2a' },
  { name: 'Crimson', hex: '#a3143c' }, { name: 'Rust', hex: '#9a4a24' },
  { name: 'Burnt Orange', hex: '#c8561e' }, { name: 'Bright Orange', hex: '#f08226' },
  { name: 'Rich Amber', hex: '#c27a1c' }, { name: 'Golden Yellow', hex: '#e4b424' },
  { name: 'Sun Yellow', hex: '#f4dc3c' }, { name: 'Ochre', hex: '#b8903c' },
  { name: 'Leather Brown', hex: '#7a4e2c' }, { name: 'Dark Brown', hex: '#46301e' },
  { name: 'Khaki', hex: '#a89c6c' }, { name: 'Olive Drab', hex: '#5c6234' },
  { name: 'Moss Green', hex: '#5e7a2e' }, { name: 'Bright Green', hex: '#4cb03c' },
  { name: 'Lime', hex: '#a8d43c' }, { name: 'Forest Green', hex: '#24502c' },
  { name: 'Jade', hex: '#2a8a62' }, { name: 'Rich Teal', hex: '#147a78' },
  { name: 'Bright Teal', hex: '#2cc0b4' }, { name: 'Turquoise', hex: '#3ac4d4' },
  { name: 'Sky Blue', hex: '#6cb0e4' }, { name: 'Royal Blue', hex: '#2a4ab4' },
  { name: 'Navy', hex: '#1c2654' }, { name: 'Slate Blue', hex: '#4a5c80' },
  { name: 'Deep Violet', hex: '#4a2a7c' }, { name: 'Purple', hex: '#7a34a4' },
  { name: 'Lavender', hex: '#a88cd4' }, { name: 'Bold Magenta', hex: '#c42aa4' },
  { name: 'Hot Pink', hex: '#ec4c9c' }, { name: 'Dusty Pink', hex: '#d49aa4' },
  { name: 'Flesh', hex: '#d8a080' }, { name: 'Tan', hex: '#c09068' },
  { name: 'Gold', hex: '#c8a03c' }, { name: 'Bronze', hex: '#8c6430' },
  { name: 'Silver', hex: '#b4b8bc' }, { name: 'Gunmetal', hex: '#5a5e64' },
];

const NAMED_LABS = NAMED_COLORS.map((c) => ({ ...c, lab: hexToLab(c.hex) }));

export function nameColor(hex: string): string {
  const lab = hexToLab(hex);
  let best = NAMED_LABS[0];
  let bestD = Infinity;
  for (const c of NAMED_LABS) {
    const d = deltaE76(lab, c.lab);
    if (d < bestD) { bestD = d; best = c; }
  }
  return best.name;
}

export function asSwatches(value: unknown): Swatch[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (v): v is Swatch => !!v && typeof v.name === 'string' && typeof v.hex === 'string' && /^#[0-9a-f]{6}$/i.test(v.hex),
  );
}
