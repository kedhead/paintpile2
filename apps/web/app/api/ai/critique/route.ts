import { NextRequest, NextResponse } from 'next/server';
import { validatePBAuth, validateAndDeductCredits, createAnthropicClient, fetchImageAsBase64, parseAIJson } from '../../../../lib/ai-helpers';

export async function POST(req: NextRequest) {
  try {
    const { projectId, imageUrl, pbToken } = await req.json();

    if (!projectId || !imageUrl || !pbToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { pb, userId } = await validatePBAuth(pbToken);
    const { creditsUsed } = await validateAndDeductCredits(pb, userId, 'paintSuggestions');

    const anthropic = createAnthropicClient();
    const { base64, mediaType } = await fetchImageAsBase64(imageUrl);

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
              text: `You are an expert miniature painting critic. Analyze this painted miniature photo and provide a detailed critique.

Respond with ONLY valid JSON in this exact format:
{
  "score": <number 0-100>,
  "grade": "<letter grade: S, A, B, C, D, F>",
  "analysis": "<2-3 sentence overall analysis>",
  "colors": "<brief color palette description>",
  "technical_strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"]
}

Score guide: 90+ = S (competition winner), 75-89 = A (display quality), 60-74 = B (tabletop+), 40-59 = C (tabletop), 20-39 = D (needs work), <20 = F.
Focus on: paint consistency, edge highlighting, blending, basing, color theory, contrast, details.`,
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const critique = parseAIJson(text) as Record<string, unknown>;
    critique.createdAt = new Date().toISOString();

    // Save critique to project
    await pb.collection('projects').update(projectId, {
      last_critique: JSON.stringify(critique),
    });

    return NextResponse.json({ success: true, data: { critique, creditsUsed } });
  } catch (error) {
    console.error('Critique error:', error);
    const message = error instanceof Error ? error.message : 'Critique failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
