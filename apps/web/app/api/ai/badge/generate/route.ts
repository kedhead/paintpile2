import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { validatePBAuth, validateAndDeductCredits, parseAIJson } from '../../../../../lib/ai-helpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 1401 });

    const token = authHeader.split(' ')[1];
    const { pb, userId, user } = await validatePBAuth(token);

    // Only admins can generate badges
    if (!user.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 1403 });
    }

    const { prompt } = await req.json();

    await validateAndDeductCredits(pb, userId, 'techniqueAdvisor'); // Using advisor as proxy for badge gen cost

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const systemPrompt = `You are an AI achievement generator for Paintpile, a social network for miniature painters.
Generate a new, creative achievement (badge) based on the user's prompt.
The response must be valid JSON with the following structure:
{
  "name": "Badge Name",
  "description": "Short, flavor-text style description",
  "category": "projects | armies | recipes | social | community | special | time | engagement",
  "tier": "bronze | silver | gold | platinum | legendary",
  "color": "#HEXCODE",
  "requirement": "Clear text description of how to earn it",
  "trigger_type": "stat_milestone | manual",
  "trigger_field": "project_count | army_count | recipe_count | follower_count | comment_count | like_given_count | like_received_count | photo_count | paint_owned_count | diary_count | challenge_entry_count",
  "trigger_value": 10,
  "icon_prompt": "A detailed DALL-E prompt for a high-quality, minimalistic, flat vector game icon representing this badge."
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: `Generate a badge for: ${prompt}` }],
    });

    const content = (response.content[0] as { text: string }).text;
    const badgeData = parseAIJson(content);

    return NextResponse.json({ success: true, badge: badgeData });
  } catch (error: any) {
    console.error('Badge generation error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
