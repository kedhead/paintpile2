import { NextRequest, NextResponse } from 'next/server';
import {
  validatePBAuth,
  validateAndDeductCredits,
  createAnthropicClient,
} from '../../../../lib/ai-helpers';

export async function POST(req: NextRequest) {
  try {
    const { title, paints, steps, pbToken } = await req.json();

    if (!pbToken) {
      return NextResponse.json({ error: 'Missing pbToken' }, { status: 400 });
    }

    const { pb, userId } = await validatePBAuth(pbToken);
    const { creditsUsed } = await validateAndDeductCredits(pb, userId, 'palettePostCaption');

    const anthropic = createAnthropicClient();

    const paintList =
      Array.isArray(paints) && paints.length > 0
        ? paints.map((p: { name: string; brand?: string }) =>
            p.brand ? `${p.name} (${p.brand})` : p.name
          ).join(', ')
        : 'various paints';

    const stepSummary =
      Array.isArray(steps) && steps.length > 0
        ? steps
            .map((s: { description?: string }, i: number) =>
              s.description ? `Step ${i + 1}: ${s.description}` : null
            )
            .filter(Boolean)
            .join('\n')
        : '';

    const prompt = `You are a social media expert for the miniature painting hobby. Write an engaging Instagram caption for a painting tutorial.

Tutorial title: ${title || 'Painting Tutorial'}
Paints used: ${paintList}
${stepSummary ? `\nTutorial steps:\n${stepSummary}` : ''}

Write a caption that:
- Opens with a hook (1 sentence that grabs attention)
- Briefly describes what the tutorial covers (2-3 sentences)
- Mentions key paints or techniques used
- Ends with 8-12 relevant hashtags on a new line

Keep it under 300 words. Be enthusiastic but authentic — write like a real hobbyist, not a marketing bot. Do NOT wrap the output in quotes or JSON. Just write the caption text directly.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const caption =
      response.content[0].type === 'text' ? response.content[0].text.trim() : '';

    return NextResponse.json({ success: true, data: { caption, creditsUsed } });
  } catch (error) {
    console.error('Palette post caption generation error:', error);
    const message = error instanceof Error ? error.message : 'Caption generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
