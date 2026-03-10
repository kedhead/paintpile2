import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '../../../../lib/admin-helpers';

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/Arcturus5404/miniature-paints/main/paints';

const MANUFACTURER_FILES: Record<string, string> = {
  'Citadel': 'Citadel_Colour.md',
  'Vallejo': 'Vallejo.md',
  'Army Painter': 'Army_Painter.md',
  'Scale75': 'Scale75.md',
  'P3': 'P3.md',
  'Reaper': 'Reaper.md',
  'AK Interactive': 'AK.md',
  'Kimera': 'KimeraKolors.md',
  'Monument': 'Monument.md',
  'Green Stuff World': 'GreenStuffWorld.md',
  'Turbo Dork': 'TurboDork.md',
  'Tamiya': 'Tamiya.md',
  'Foundry': 'Foundry.md',
  'Warcolours': 'Warcolours.md',
};

// Map set/range names to our type values
const TYPE_MAP: Record<string, string> = {
  'base': 'base',
  'layer': 'layer',
  'shade': 'shade',
  'wash': 'wash',
  'metallic': 'metallic',
  'technical': 'technical',
  'contrast': 'contrast',
  'air': 'air',
  'spray': 'spray',
  'dry': 'dry',
  'texture': 'texture',
  'ink': 'ink',
  'primer': 'primer',
};

function normalizeType(raw: string): string {
  const lower = raw.toLowerCase().trim();
  for (const [key, value] of Object.entries(TYPE_MAP)) {
    if (lower.includes(key)) return value;
  }
  return 'standard';
}

function extractHex(raw: string): string {
  // Format: ![#HEX](url) `#HEX` or just #HEX
  const match = raw.match(/#([0-9A-Fa-f]{6})/);
  return match ? `#${match[1].toUpperCase()}` : '#808080';
}

interface ParsedPaint {
  name: string;
  brand: string;
  hex_color: string;
  type: string;
}

function parseMarkdownTable(markdown: string, brand: string): ParsedPaint[] {
  const lines = markdown.split('\n');
  const paints: ParsedPaint[] = [];

  let headers: string[] = [];
  let pastHeader = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) {
      headers = [];
      pastHeader = false;
      continue;
    }

    const cells = trimmed.split('|').map(c => c.trim()).filter(c => c !== '');

    // Detect header row
    if (headers.length === 0) {
      headers = cells.map(h => h.toLowerCase());
      continue;
    }

    // Skip separator row (---|---|---)
    if (!pastHeader) {
      if (cells.every(c => /^[-:]+$/.test(c))) {
        pastHeader = true;
        continue;
      }
      // Not a separator, treat as data
      pastHeader = true;
    }

    const nameIdx = headers.findIndex(h => h === 'name' || h === 'paint');
    const hexIdx = headers.findIndex(h => h === 'hex');
    const setIdx = headers.findIndex(h => h === 'set' || h === 'type' || h === 'range' || h === 'category');

    if (nameIdx < 0 || nameIdx >= cells.length) continue;

    const name = cells[nameIdx];
    if (!name) continue;

    const hex_color = (hexIdx >= 0 && hexIdx < cells.length) ? extractHex(cells[hexIdx]) : '#808080';
    const rawType = (setIdx >= 0 && setIdx < cells.length) ? cells[setIdx] : '';
    const type = normalizeType(rawType);

    paints.push({ name, brand, hex_color, type });
  }

  return paints;
}

export async function POST(req: NextRequest) {
  try {
    const { pbToken, manufacturers } = await req.json();

    if (!pbToken || !manufacturers || !Array.isArray(manufacturers)) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const { pb } = await validateAdminAuth(pbToken);

    const results: Record<string, { created: number; skipped: number; failed: number; error?: string }> = {};

    for (const manufacturer of manufacturers) {
      const fileName = MANUFACTURER_FILES[manufacturer];
      if (!fileName) {
        results[manufacturer] = { created: 0, skipped: 0, failed: 0, error: 'Unknown manufacturer' };
        continue;
      }

      try {
        const url = `${GITHUB_RAW_BASE}/${fileName}`;
        const response = await fetch(url);
        if (!response.ok) {
          results[manufacturer] = { created: 0, skipped: 0, failed: 0, error: `HTTP ${response.status} from GitHub` };
          continue;
        }

        const markdown = await response.text();
        const paints = parseMarkdownTable(markdown, manufacturer);

        let created = 0;
        let skipped = 0;
        let failed = 0;

        for (const paint of paints) {
          try {
            // Check if paint already exists
            const existing = await pb.collection('paints').getFullList({
              filter: `name="${paint.name.replace(/"/g, '\\"')}" && brand="${paint.brand.replace(/"/g, '\\"')}"`,
              requestKey: null,
            });

            if (existing.length > 0) {
              skipped++;
              continue;
            }

            await pb.collection('paints').create({
              name: paint.name,
              brand: paint.brand,
              hex_color: paint.hex_color,
              type: paint.type,
            });
            created++;
          } catch {
            failed++;
          }
        }

        results[manufacturer] = { created, skipped, failed };
      } catch (err) {
        results[manufacturer] = { created: 0, skipped: 0, failed: 0, error: err instanceof Error ? err.message : 'Fetch failed' };
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to import paints';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
