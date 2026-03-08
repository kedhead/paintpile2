import { NextRequest, NextResponse } from 'next/server';
import { validatePBAuth, validateAndDeductCredits, createAnthropicClient, fetchImageAsBase64, parseAIJson } from '../../../../lib/ai-helpers';

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, question, pbToken } = await req.json();

    if (!imageUrl || !pbToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { pb, userId } = await validatePBAuth(pbToken);
    const { creditsUsed } = await validateAndDeductCredits(pb, userId, 'techniqueAdvisor');

    const anthropic = createAnthropicClient();
    const { base64, mediaType } = await fetchImageAsBase64(imageUrl);

    const questionLine = question ? `\nSpecific question: ${question}` : '';

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
              text: `You are an expert miniature painting instructor. Analyze this miniature and provide technique recommendations to improve the paint job.${questionLine}

Respond with ONLY valid JSON in this exact format:
{
  "techniques": [
    {
      "name": "<technique name>",
      "description": "<what this technique does>",
      "steps": ["<step 1>", "<step 2>", "<step 3>"],
      "difficulty": "<beginner/intermediate/advanced>",
      "area": "<which area of the mini to apply this>"
    }
  ],
  "next_steps": "<what to focus on next to level up>",
  "skill_level": "<estimated current skill: beginner/intermediate/advanced/expert>"
}

Focus on practical, actionable techniques: edge highlighting, wet blending, layering, glazing, NMM, OSL, drybrushing, stippling, etc.`,
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const advice = parseAIJson(text) as Record<string, unknown>;

    return NextResponse.json({ success: true, data: { ...advice, creditsUsed } });
  } catch (error) {
    console.error('Technique advisor error:', error);
    const message = error instanceof Error ? error.message : 'Technique advice failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
