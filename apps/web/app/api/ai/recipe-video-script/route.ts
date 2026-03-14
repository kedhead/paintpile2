import { NextRequest, NextResponse } from 'next/server';
import {
  validatePBAuth,
  validateAndDeductCredits,
  createAnthropicClient,
  parseAIJson,
} from '../../../../lib/ai-helpers';

export async function POST(req: NextRequest) {
  try {
    const { recipe, pbToken } = await req.json();

    if (!recipe || !pbToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { pb, userId } = await validatePBAuth(pbToken);
    const { creditsUsed } = await validateAndDeductCredits(pb, userId, 'recipeVideoScript');

    const anthropic = createAnthropicClient();

    const recipeJson = JSON.stringify(recipe, null, 2);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are an expert miniature painting tutorial narrator. Given the following paint recipe, generate a narration script for a slideshow video. Each entry corresponds to one step and will be shown as a text overlay on that step's image.

Recipe:
${recipeJson}

Respond with ONLY valid JSON — an array matching this format:
[
  {
    "step_index": 0,
    "narration": "<short narration text for voiceover/subtitle, 1-2 sentences>",
    "duration_seconds": <how long to show this step, 4-10 seconds>,
    "text_overlay": "<brief text overlay shown on screen, max 8 words>"
  }
]

Also include an intro slide (step_index: -1) with the recipe name and a closing slide (step_index: -2) with a summary.

Keep narrations concise and instructional. Duration should be proportional to step complexity.`,
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const script = parseAIJson(text) as Record<string, unknown>[];

    return NextResponse.json({ success: true, data: { script, creditsUsed } });
  } catch (error) {
    console.error('Recipe video script error:', error);
    const message = error instanceof Error ? error.message : 'Script generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
