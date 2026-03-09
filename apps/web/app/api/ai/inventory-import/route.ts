import { NextRequest, NextResponse } from 'next/server';
import { validatePBAuth, validateAndDeductCredits, createAnthropicClient, parseAIJson } from '../../../../lib/ai-helpers';

export async function POST(req: NextRequest) {
  try {
    const { text, pbToken } = await req.json();

    if (!text || !pbToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { pb, userId } = await validatePBAuth(pbToken);
    const { creditsUsed } = await validateAndDeductCredits(pb, userId, 'paintSuggestions');

    const anthropic = createAnthropicClient();

    // Get all paints from database for matching
    const allPaints = await pb.collection('paints').getFullList({
      fields: 'id,name,brand',
    });

    const paintList = allPaints.map((p) => `${p.brand}: ${p.name} (${p.id})`).join('\n');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `Extract paint names from this user description and match them to paints in our database.

User text: "${text}"

Available paints in database:
${paintList.slice(0, 8000)}

Respond with ONLY valid JSON array:
[
  {
    "input": "<what the user wrote>",
    "paintId": "<matched paint id or null>",
    "name": "<matched paint name>",
    "brand": "<matched paint brand>",
    "confidence": <0.0 to 1.0>
  }
]

Match as many as you can. Set paintId to null and confidence to 0 if no match found.`,
        },
      ],
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '[]';
    const matches = parseAIJson(responseText);

    return NextResponse.json({ success: true, matches, creditsUsed });
  } catch (error) {
    console.error('Inventory import error:', error);
    const message = error instanceof Error ? error.message : 'Import failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
