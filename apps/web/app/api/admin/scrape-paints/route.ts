import { NextRequest, NextResponse } from 'next/server';
import { createAnthropicClient, validatePBAuth } from '../../../../lib/ai-helpers';

export const maxDuration = 300; // 5 minutes for AI generation

interface ScrapedPaintSet {
  setName: string;
  brand: string;
  paintCount: number;
  paintNames: string[];
  sourceUrl: string;
  description?: string;
}

interface ScrapeResult {
  brand: string;
  sets: ScrapedPaintSet[];
  scrapedAt: string;
  errors: string[];
}

/**
 * Ask Claude for known paint sets from a brand
 */
async function getSetNames(client: ReturnType<typeof createAnthropicClient>, brandName: string): Promise<string[]> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `List the names of official paint sets, starter sets, and collection boxes released by ${brandName}.

Rules:
1. Only official product names.
2. Include current and popular discontinued sets.
3. Exclude single paints or individual bottles.
4. Limit to the top 20 most popular/comprehensive sets.

Return a strictly valid JSON array of strings. Example:
["Set Name 1", "Set Name 2"]`,
    }],
  });

  const text = response.content.find(c => c.type === 'text');
  if (!text || text.type !== 'text') throw new Error('No response');

  const jsonMatch = text.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No JSON array found');
  return JSON.parse(jsonMatch[0]);
}

/**
 * Ask Claude for details of a specific paint set
 */
async function getSetDetails(
  client: ReturnType<typeof createAnthropicClient>,
  brandName: string,
  setName: string
): Promise<ScrapedPaintSet | null> {
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `For the ${brandName} product "${setName}":
Provide the description and list of included paints.

Return a strictly valid JSON object. Example:
{
  "description": "Brief description here...",
  "paints": ["Paint 1", "Paint 2"]
}`,
      }],
    });

    const text = response.content.find(c => c.type === 'text');
    if (!text || text.type !== 'text') return null;

    const jsonMatch = text.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const data = JSON.parse(jsonMatch[0]);
    if (!data?.paints?.length) return null;

    return {
      setName,
      brand: brandName,
      paintCount: data.paints.length,
      paintNames: data.paints,
      sourceUrl: `https://google.com/search?q=${encodeURIComponent(brandName + ' ' + setName)}`,
      description: data.description || '',
    };
  } catch (error) {
    console.error(`Failed to get details for ${setName}:`, error);
    return null;
  }
}

/**
 * Generate paint sets for a brand using AI
 */
async function generateBrandSets(client: ReturnType<typeof createAnthropicClient>, brandName: string): Promise<ScrapeResult> {
  const errors: string[] = [];

  try {
    const setNames = await getSetNames(client, brandName);
    console.log(`[Scraper] Found ${setNames.length} sets for ${brandName}`);

    const sets: ScrapedPaintSet[] = [];
    const batchSize = 3;

    for (let i = 0; i < setNames.length; i += batchSize) {
      const batch = setNames.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(name => getSetDetails(client, brandName, name))
      );
      sets.push(...results.filter((s): s is ScrapedPaintSet => s !== null));

      if (i + batchSize < setNames.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return { brand: brandName, sets, scrapedAt: new Date().toISOString(), errors };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    errors.push(message);
    return { brand: brandName, sets: [], scrapedAt: new Date().toISOString(), errors };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { pbToken, brands } = await request.json();

    // Verify admin
    const { user } = await validatePBAuth(pbToken);
    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    if (!brands || !Array.isArray(brands) || brands.length === 0) {
      return NextResponse.json({ success: false, error: 'No brands specified' }, { status: 400 });
    }

    const client = createAnthropicClient();
    const results: ScrapeResult[] = [];

    for (const brand of brands) {
      console.log(`[Scraper] Processing ${brand}...`);
      const result = await generateBrandSets(client, brand);
      results.push(result);
      console.log(`[Scraper] ${brand}: Found ${result.sets.length} sets`);
    }

    const totalSets = results.reduce((sum, r) => sum + r.sets.length, 0);

    return NextResponse.json({
      success: true,
      results,
      summary: { totalSets, brands: results.map(r => r.brand) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Scraping failed';
    console.error('[Scraper] Error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
