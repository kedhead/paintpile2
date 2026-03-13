import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import sharp from 'sharp';
import { validatePBAuth, validateAndDeductCredits } from '../../../../lib/ai-helpers';

const MAX_DIMENSION = 768;

async function fetchAndResizeImage(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error('Failed to fetch image');

  const buffer = Buffer.from(await response.arrayBuffer());
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width || 1024;
  const height = metadata.height || 1024;

  let resized: Buffer;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    resized = await sharp(buffer)
      .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer();
  } else {
    resized = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();
  }

  const base64 = resized.toString('base64');
  return `data:image/jpeg;base64,${base64}`;
}

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

    // Resize image for Replicate
    const resizedDataUrl = await fetchAndResizeImage(imageUrl);

    const replicate = new Replicate({ auth: apiToken });

    // Enhance the prompt to strictly preserve geometry and prevent rotation
    const enhancedPrompt = `${prompt.trim()}. Very important: Strictly preserve the exact original image geometry, pose, shape, and background. Do not rotate the model or change its outline. Only change the colors as requested.`;

    // Use google/nano-banana (Gemini 2.5 Flash Image) — same model as original Paintpile
    const output = await replicate.run(
      'google/nano-banana',
      {
        input: {
          prompt: enhancedPrompt,
          image_input: [resizedDataUrl],
          aspect_ratio: 'match_input_image',
          output_format: 'jpg',
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
