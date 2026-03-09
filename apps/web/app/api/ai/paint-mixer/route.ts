import { NextRequest, NextResponse } from 'next/server';
import { validatePBAuth, validateAndDeductCredits, createAnthropicClient } from '../../../../lib/ai-helpers';

export async function POST(req: NextRequest) {
  try {
    const { query, pbToken } = await req.json();

    if (!query || !pbToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { pb, userId } = await validatePBAuth(pbToken);
    const { creditsUsed } = await validateAndDeductCredits(pb, userId, 'paintSuggestions');

    const anthropic = createAnthropicClient();

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `You are an expert miniature paint mixing advisor. A painter wants to create this color: "${query}"

Provide a practical mixing recipe using common miniature paints (Citadel, Vallejo, Army Painter, Scale75).

Include:
1. Base paint(s) and approximate ratios
2. Step-by-step mixing instructions
3. Tips for achieving the right consistency
4. Alternative paint options if the primary ones aren't available

Keep the response concise and practical.`,
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({ success: true, recipe: text, creditsUsed });
  } catch (error) {
    console.error('Paint mixer error:', error);
    const message = error instanceof Error ? error.message : 'Paint mixer failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
