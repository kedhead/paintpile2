import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '../../../../lib/admin-helpers';
import { createAnthropicClient, parseAIJson } from '../../../../lib/ai-helpers';
import { CURATED_RECIPES } from '../../../../lib/seed-recipe-data';

export async function GET(req: NextRequest) {
  try {
    const pbToken = req.nextUrl.searchParams.get('pbToken');
    if (!pbToken) {
      return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 });
    }
    const { pb } = await validateAdminAuth(pbToken);
    const result = await pb.collection('recipes').getList(1, 1, { filter: 'is_public = true' });
    return NextResponse.json({ success: true, total: result.totalItems });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get recipe count';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pbToken, type } = body;

    if (!pbToken || !type) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const { pb, userId } = await validateAdminAuth(pbToken);

    if (type === 'curated') {
      let created = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const recipe of CURATED_RECIPES) {
        try {
          const existing = await pb.collection('recipes').getList(1, 1, {
            filter: `name="${recipe.name.replace(/"/g, '\\"')}"`,
          });
          if (existing.totalItems > 0) {
            skipped++;
            continue;
          }
          await pb.collection('recipes').create({
            user: userId,
            name: recipe.name,
            description: recipe.description || '',
            category: recipe.category || '',
            difficulty: recipe.difficulty || 'beginner',
            is_public: true,
            ingredients: JSON.stringify(recipe.ingredients || []),
            steps: JSON.stringify(recipe.steps || []),
            techniques: JSON.stringify(recipe.techniques || []),
          });
          created++;
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'unknown error';
          errors.push(`${recipe.name}: ${msg}`);
        }
      }

      return NextResponse.json({ success: true, created, skipped, errors });
    }

    if (type === 'ai') {
      const { category, difficulty, count = 1 } = body;
      if (!category || !difficulty) {
        return NextResponse.json({ success: false, error: 'Missing category or difficulty' }, { status: 400 });
      }

      const safeCount = Math.min(Math.max(Number(count) || 1, 1), 5);
      const anthropic = createAnthropicClient();

      const prompt = `You are an expert miniature painter. Generate ${safeCount} distinct painting recipe(s) for the category "${category}" at "${difficulty}" difficulty. Use real Citadel, Vallejo, or Army Painter paint names with accurate hex color codes.

Respond with ONLY a valid JSON array (no markdown, no extra text). Each element must match this exact structure:
{
  "name": "<unique recipe name>",
  "description": "<2-3 sentence description of the technique and result>",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "techniques": ["<one of: nmm, osl, drybrushing, layering, glazing, washing, blending, feathering, stippling, wetblending, zenithal, airbrushing, freehand, weathering>"],
  "ingredients": [
    {
      "paint_name": "<paint name>",
      "paint_brand": "<Citadel or Vallejo or Army Painter>",
      "paint_color": "<#hexcode>",
      "role": "<one of: base, highlight, shadow, midtone, glaze, wash, layer, accent>"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "<short step title>",
      "instruction": "<detailed instruction, 1-3 sentences>",
      "estimated_time": <minutes as integer>,
      "technique": "<technique name>",
      "paint_indices": [<0-based indices of paints from ingredients used in this step>],
      "tips": ["<optional practical tip>"]
    }
  ]
}`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '[]';

      let recipes: ReturnType<typeof parseAIJson>;
      try {
        recipes = parseAIJson(text);
      } catch {
        return NextResponse.json({ success: false, error: 'AI returned invalid JSON. Try again.' }, { status: 500 });
      }

      if (!Array.isArray(recipes)) {
        return NextResponse.json({ success: false, error: 'AI response was not a JSON array. Try again.' }, { status: 500 });
      }

      let created = 0;
      const errors: string[] = [];

      for (const recipe of recipes as Record<string, unknown>[]) {
        try {
          await pb.collection('recipes').create({
            user: userId,
            name: recipe.name || 'Untitled Recipe',
            description: recipe.description || '',
            category: recipe.category || category,
            difficulty: recipe.difficulty || difficulty,
            is_public: true,
            ingredients: JSON.stringify(recipe.ingredients || []),
            steps: JSON.stringify(recipe.steps || []),
            techniques: JSON.stringify(recipe.techniques || []),
          });
          created++;
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'unknown error';
          errors.push(`${recipe.name || 'recipe'}: ${msg}`);
        }
      }

      return NextResponse.json({ success: true, created, errors });
    }

    return NextResponse.json({ success: false, error: `Unknown type: ${type}` }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Seed recipes failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
