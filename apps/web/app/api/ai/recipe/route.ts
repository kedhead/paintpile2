import { NextRequest, NextResponse } from 'next/server';
import { validatePBAuth, validateAndDeductCredits, createAnthropicClient, fetchImageAsBase64, parseAIJson } from '../../../../lib/ai-helpers';

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, context, pbToken } = await req.json();

    if (!imageUrl || !pbToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { pb, userId } = await validatePBAuth(pbToken);
    const { creditsUsed } = await validateAndDeductCredits(pb, userId, 'recipeGeneration');

    const anthropic = createAnthropicClient();
    const { base64, mediaType } = await fetchImageAsBase64(imageUrl);

    const contextLine = context ? `\nAdditional context: ${context}` : '';

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
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
              text: `You are an expert miniature painter. Generate a complete paint recipe to recreate the paint job in this photo.${contextLine}

Respond with ONLY valid JSON matching this format:
{
  "name": "<recipe name>",
  "description": "<brief description>",
  "category": "<miniature|terrain|vehicle|bust|diorama>",
  "difficulty": "<beginner|intermediate|advanced|expert>",
  "techniques": ["<technique1>", "<technique2>"],
  "surfaceType": "<plastic|resin|metal|mixed>",
  "estimatedTime": <minutes>,
  "ingredients": [
    {
      "hexColor": "<#hex>",
      "colorName": "<color name>",
      "role": "<base|layer|shade|highlight|glaze|drybrush|wash|accent>",
      "notes": "<usage notes>"
    }
  ],
  "steps": [
    {
      "stepNumber": 1,
      "title": "<step title>",
      "instruction": "<detailed instruction>",
      "paints": ["<paint name>"],
      "technique": "<technique used>",
      "tips": ["<tip>"]
    }
  ],
  "mixingInstructions": "<any mixing notes>",
  "applicationTips": "<general tips>",
  "confidence": <0.0-1.0>
}

Use real paint names from Citadel, Vallejo, Army Painter, or Scale75.`,
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const recipe = parseAIJson(text) as Record<string, unknown>;

    return NextResponse.json({ success: true, data: { recipe, creditsUsed } });
  } catch (error) {
    console.error('Recipe generation error:', error);
    const message = error instanceof Error ? error.message : 'Recipe generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
