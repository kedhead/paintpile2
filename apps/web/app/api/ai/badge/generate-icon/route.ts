import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { validatePBAuth, validateAndDeductCredits } from '../../../../../lib/ai-helpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 1401 });

    const token = authHeader.split(' ')[1];
    const { pb, userId, user } = await validatePBAuth(token);

    // Only admins can generate icons
    if (!user.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 1403 });
    }

    const { prompt, style = 'flat vector icon, white background, simple, high contrast, minimalistic, game badge style' } = await req.json();

    await validateAndDeductCredits(pb, userId, 'upscaling'); // Using upscale as proxy for image gen cost

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Using Flux or SDXL for speed/quality
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: `${prompt}, ${style}`,
          aspect_ratio: "1:1",
          output_format: "png",
        }
      }
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;
    if (!imageUrl) throw new Error("Image generation failed");

    // Download and upload to PocketBase storage
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], 'badge_icon.png', { type: 'image/png' });

    // Since we are in an API and need to return a URL, we'll return the URL
    // The client side (Admin UI) will then handle creating the badge record with this URL or Lucide name.
    
    return NextResponse.json({ 
      success: true, 
      url: imageUrl // In a real production app, we would re-host this. For now, returning the generated URL.
    });

  } catch (error: any) {
    console.error('Badge icon generation error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
