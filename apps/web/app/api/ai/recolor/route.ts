import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { validatePBAuth, validateAndDeductCredits } from '../../../../lib/ai-helpers';

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, prompt, pbToken } = await req.json();

    if (!imageUrl || !prompt || !pbToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json({ error: 'Replicate not configured' }, { status: 500 });
    }

    const { pb, userId } = await validatePBAuth(pbToken);
    const { creditsUsed } = await validateAndDeductCredits(pb, userId, 'recolor');

    const replicate = new Replicate({ auth: apiToken });

    const output = await replicate.run(
      'timothybrooks/instruct-pix2pix:30c1d0b916a6f8efce20493f5d61ee27491ab2a60437c13c588468b9810ec23f',
      {
        input: {
          image: imageUrl,
          prompt: `Recolor this miniature: ${prompt}`,
          num_inference_steps: 30,
          image_guidance_scale: 1.5,
          guidance_scale: 7.5,
        },
      }
    );

    // Handle Replicate output format
    let resultUrl: string;
    if (Array.isArray(output)) {
      resultUrl = String(output[0]);
    } else if (typeof output === 'string') {
      resultUrl = output;
    } else {
      resultUrl = String(output);
    }

    if (!resultUrl.startsWith('http')) {
      return NextResponse.json({ error: 'Recoloring failed — invalid output' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { imageUrl: resultUrl, creditsUsed } });
  } catch (error) {
    console.error('Recolor error:', error);
    const message = error instanceof Error ? error.message : 'Recoloring failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
