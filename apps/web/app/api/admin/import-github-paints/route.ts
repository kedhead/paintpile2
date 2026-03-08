import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '../../../../lib/admin-helpers';

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/kutchmeister/miniature-paints/main';

const MANUFACTURER_FILES: Record<string, string> = {
  'Citadel': 'citadel.md',
  'Vallejo Game Color': 'vallejo-game-color.md',
  'Vallejo Model Color': 'vallejo-model-color.md',
  'Army Painter': 'army-painter.md',
  'Scale75': 'scale75.md',
  'P3': 'p3.md',
  'Reaper': 'reaper.md',
  'AK Interactive': 'ak-interactive.md',
  'Kimera': 'kimera.md',
  'Monument': 'monument.md',
  'ProAcryl': 'proacryl.md',
};

function parseMarkdownTable(markdown: string, brand: string): Array<{ name: string; brand: string; color: string; type: string }> {
  const lines = markdown.split('\n');
  const paints: Array<{ name: string; brand: string; color: string; type: string }> = [];

  let inTable = false;
  let headers: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) {
      inTable = false;
      continue;
    }

    const cells = trimmed.split('|').map(c => c.trim()).filter(c => c !== '');

    if (!inTable) {
      headers = cells.map(h => h.toLowerCase());
      inTable = true;
      continue;
    }

    // Skip separator row
    if (cells.every(c => /^[-:]+$/.test(c))) continue;

    const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('paint'));
    const colorIdx = headers.findIndex(h => h.includes('hex') || h.includes('color') || h.includes('rgb'));
    const typeIdx = headers.findIndex(h => h.includes('type') || h.includes('range') || h.includes('category'));

    if (nameIdx >= 0 && nameIdx < cells.length) {
      paints.push({
        name: cells[nameIdx] || '',
        brand,
        color: (colorIdx >= 0 && colorIdx < cells.length) ? cells[colorIdx] : '#808080',
        type: (typeIdx >= 0 && typeIdx < cells.length) ? cells[typeIdx] : 'Standard',
      });
    }
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

    const results: Record<string, { created: number; failed: number; error?: string }> = {};

    for (const manufacturer of manufacturers) {
      const fileName = MANUFACTURER_FILES[manufacturer];
      if (!fileName) {
        results[manufacturer] = { created: 0, failed: 0, error: 'Unknown manufacturer' };
        continue;
      }

      try {
        const url = `${GITHUB_RAW_BASE}/${fileName}`;
        const response = await fetch(url);
        if (!response.ok) {
          results[manufacturer] = { created: 0, failed: 0, error: `HTTP ${response.status}` };
          continue;
        }

        const markdown = await response.text();
        const paints = parseMarkdownTable(markdown, manufacturer);

        let created = 0;
        let failed = 0;

        for (const paint of paints) {
          try {
            await pb.collection('paints').create({
              name: paint.name,
              brand: paint.brand,
              color: paint.color,
              type: paint.type,
              is_custom: false,
            });
            created++;
          } catch {
            failed++;
          }
        }

        results[manufacturer] = { created, failed };
      } catch (err) {
        results[manufacturer] = { created: 0, failed: 0, error: err instanceof Error ? err.message : 'Fetch failed' };
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to import paints';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
