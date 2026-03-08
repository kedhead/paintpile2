import { NextRequest, NextResponse } from 'next/server';
import { validatePBAuth, validateAndDeductCredits, createAnthropicClient, fetchImageAsBase64 } from '../../../../lib/ai-helpers';

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, context, pbToken } = await req.json();

    if (!imageUrl || !pbToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { pb, userId } = await validatePBAuth(pbToken);
    const { creditsUsed } = await validateAndDeductCredits(pb, userId, 'paintSuggestions');

    const anthropic = createAnthropicClient();
    const { base64, mediaType } = await fetchImageAsBase64(imageUrl);

    const contextLine = context ? `\nAdditional context: ${context}` : '';

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType as 'image/jpeg', data: base64 },
            },
            {
              type: 'text',
              text: `You are an expert miniature painter. Analyze this miniature photo and suggest specific paints for each area/color you can identify.${contextLine}

Respond with ONLY valid JSON in this exact format:
{
  "suggestions": [
    {
      "area": "<area name, e.g. 'Armor Plates'>",
      "hex": "<hex color code>",
      "paints": [
        { "brand": "<brand name>", "name": "<paint name>", "type": "<base/layer/shade/contrast>" }
      ],
      "technique": "<brief technique tip for this area>"
    }
  ],
  "overall_scheme": "<brief description of the color scheme>",
  "palette_type": "<warm/cool/neutral/complementary/triadic>"
}

Suggest paints from Citadel, Vallejo, Army Painter, or Scale75. Include base, layer, and shade for each area where relevant.`,
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const suggestions = JSON.parse(text);

    return NextResponse.json({ success: true, data: { ...suggestions, creditsUsed } });
  } catch (error) {
    console.error('Paint suggestions error:', error);
    const message = error instanceof Error ? error.message : 'Paint suggestion failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
