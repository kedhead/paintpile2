import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { validatePBAuth, validateAndDeductCredits } from '../../../../../lib/ai-helpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.split(' ')[1];
    const { pb, userId, user } = await validatePBAuth(token);

    // Only admins can generate icons
    if (!user.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { prompt, style = 'flat vector icon, white background, simple, high contrast, minimalistic, game badge style' } = await req.json();

    await validateAndDeductCredits(pb, userId, 'upscaling');

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

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

    // Download the generated image and upload to PocketBase for permanent storage
    const response = await fetch(imageUrl as string);
    const blob = await response.blob();
    const filename = `badge_icon_${Date.now()}.png`;
    const file = new File([blob], filename, { type: 'image/png' });

    // Upload to a general uploads collection if it exists, otherwise return temp URL
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user', userId);
      formData.append('purpose', 'badge_icon');
      const upload = await pb.collection('uploads').create(formData);
      const permanentUrl = pb.files.getURL(upload, upload.file);

      return NextResponse.json({
        success: true,
        url: permanentUrl,
      });
    } catch {
      // If uploads collection doesn't exist, return the Replicate URL
      // Admin should save/re-upload promptly as these URLs expire
      return NextResponse.json({
        success: true,
        url: imageUrl,
        warning: 'Image URL is temporary. Save the badge promptly.',
      });
    }

  } catch (error: any) {
    console.error('Badge icon generation error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
