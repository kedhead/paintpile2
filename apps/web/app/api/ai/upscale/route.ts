import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { validatePBAuth, validateAndDeductCredits } from '../../../../lib/ai-helpers';

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, pbToken } = await req.json();

    if (!imageUrl || !pbToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json({ error: 'Replicate not configured' }, { status: 500 });
    }

    const { pb, userId } = await validatePBAuth(pbToken);
    const { creditsUsed } = await validateAndDeductCredits(pb, userId, 'upscaling');

    const replicate = new Replicate({ auth: apiToken });

    const output = await replicate.run(
      'nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa',
      {
        input: {
          image: imageUrl,
          scale: 4,
          face_enhance: false,
        },
      }
    );

    // Handle Replicate output format (can be string, array, or FileOutput)
    let resultUrl: string;
    if (Array.isArray(output)) {
      resultUrl = String(output[0]);
    } else if (typeof output === 'string') {
      resultUrl = output;
    } else {
      resultUrl = String(output);
    }

    if (!resultUrl.startsWith('http')) {
      return NextResponse.json({ error: 'Upscaling failed — invalid output' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { imageUrl: resultUrl, creditsUsed } });
  } catch (error) {
    console.error('Upscale error:', error);
    const message = error instanceof Error ? error.message : 'Upscaling failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
