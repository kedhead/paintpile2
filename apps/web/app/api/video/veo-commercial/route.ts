import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300;

const ONEMIN_API_KEY = process.env.ONEMIN_API_KEY || '';
const VIDEO_API_SECRET = process.env.VIDEO_API_SECRET || '';

interface VeoCommercialRequest {
  prompt: string;
  referenceImageUrls?: string[];
  aspectRatio?: '16:9' | '9:16' | '1:1';
  resolution?: '720p' | '1080p';
  generateAudio?: boolean;
  secret: string;
}

async function pollForResult(taskId: string, maxWaitMs: number): Promise<string> {
  const start = Date.now();
  const pollInterval = 10000; // 10 seconds

  while (Date.now() - start < maxWaitMs) {
    const res = await fetch(`https://api.1min.ai/api/features/status/${taskId}`, {
      headers: { 'API-KEY': ONEMIN_API_KEY },
    });

    if (!res.ok) {
      throw new Error(`1min.ai status check failed (${res.status})`);
    }

    const data = await res.json();
    const status = data?.status || data?.aiRecord?.status;

    if (status === 'COMPLETED' || status === 'completed') {
      const url = data?.aiRecord?.temporaryUrl || data?.temporaryUrl;
      if (!url) throw new Error('Veo3 completed but no video URL returned');
      return url;
    }

    if (status === 'FAILED' || status === 'failed' || status === 'ERROR' || status === 'error') {
      const errMsg = data?.aiRecord?.error || data?.error || 'Unknown error';
      throw new Error(`Veo3 generation failed: ${errMsg}`);
    }

    // Still processing — wait and retry
    await new Promise(r => setTimeout(r, pollInterval));
  }

  throw new Error(`Veo3 generation timed out after ${maxWaitMs / 1000}s`);
}

export async function POST(req: NextRequest) {
  try {
    const body: VeoCommercialRequest = await req.json();
    const { prompt, referenceImageUrls, aspectRatio = '9:16', resolution = '1080p', generateAudio = true, secret } = body;

    if (!VIDEO_API_SECRET || secret !== VIDEO_API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!ONEMIN_API_KEY) {
      return NextResponse.json({ error: 'ONEMIN_API_KEY not configured' }, { status: 500 });
    }

    // Build 1min.ai Veo3 request
    const promptObject: Record<string, unknown> = {
      prompt: prompt.trim(),
      aspect_ratio: aspectRatio,
      resolution,
      generate_audio: generateAudio,
    };

    // Reference images only work with 16:9 aspect ratio
    if (referenceImageUrls && referenceImageUrls.length > 0 && aspectRatio === '16:9') {
      promptObject.reference_image_urls = referenceImageUrls.slice(0, 3);
    }

    console.log('[veo-commercial] Sending request to 1min.ai Veo3...');

    const res = await fetch('https://api.1min.ai/api/features', {
      method: 'POST',
      headers: {
        'API-KEY': ONEMIN_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'TEXT_TO_VIDEO',
        model: 'veo3',
        conversationId: 'TEXT_TO_VIDEO',
        promptObject,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('[veo-commercial] 1min.ai error:', res.status, errText.slice(0, 500));
      return NextResponse.json(
        { error: `1min.ai Veo3 request failed (${res.status}): ${errText.slice(0, 300)}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    console.log('[veo-commercial] 1min.ai response:', JSON.stringify(data).slice(0, 500));

    // Check if we got a direct result or need to poll
    let videoUrl = data?.aiRecord?.temporaryUrl || data?.temporaryUrl;

    if (!videoUrl) {
      // Async generation — poll for result
      const taskId = data?.aiRecord?.id || data?.id;
      if (!taskId) {
        return NextResponse.json(
          { error: '1min.ai returned no video URL and no task ID', debug: JSON.stringify(data).slice(0, 500) },
          { status: 502 }
        );
      }

      console.log(`[veo-commercial] Polling for task ${taskId}...`);
      videoUrl = await pollForResult(taskId, 270000); // 4.5 min max poll
    }

    console.log(`[veo-commercial] Downloading video from ${videoUrl.slice(0, 80)}...`);

    // Download the generated video
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) {
      return NextResponse.json(
        { error: `Failed to download generated video (${videoRes.status})` },
        { status: 502 }
      );
    }

    const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
    console.log(`[veo-commercial] Video downloaded: ${videoBuffer.length} bytes`);

    return new NextResponse(videoBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="paintpile-veo-${aspectRatio.replace(':', 'x')}.mp4"`,
        'Content-Length': String(videoBuffer.length),
      },
    });
  } catch (error) {
    console.error('[veo-commercial] Error:', error);
    const message = error instanceof Error ? error.message : 'Veo video generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
