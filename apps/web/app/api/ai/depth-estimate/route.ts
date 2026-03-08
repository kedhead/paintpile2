import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/depth-estimate
 *
 * Runs monocular depth estimation via Replicate Depth Pro,
 * computes a normal map from the depth, and returns both as
 * base64 data URLs. Free tool — no credits deducted.
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { imageUrl, pbToken } = await req.json();

    if (!imageUrl || !pbToken) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json({ success: false, error: 'Replicate not configured' }, { status: 500 });
    }

    // Download source image
    console.log('[DepthEstimate] Downloading source image...');
    const sourceResponse = await fetch(imageUrl);
    if (!sourceResponse.ok) {
      throw new Error(`Failed to download source image: ${sourceResponse.status}`);
    }
    const sourceArrayBuffer = await sourceResponse.arrayBuffer();
    const sourceBuffer = Buffer.from(sourceArrayBuffer);

    // Get dimensions using a simple approach — decode image header
    // For simplicity, we'll send the image as-is and let the model handle sizing
    // Then resize the output maps to match

    // Convert to base64 data URL for Replicate
    const contentType = sourceResponse.headers.get('content-type') || 'image/jpeg';
    const base64Source = `data:${contentType};base64,${sourceBuffer.toString('base64')}`;

    // Run depth estimation via Replicate
    console.log('[DepthEstimate] Running Depth Pro...');
    const depthModel = process.env.REPLICATE_DEPTH_MODEL ||
      'garg-aayush/ml-depth-pro:63efd78f11d91e3236df416c894f5b49e996271c3f96f98ac806288a5da59db8';

    const replicate = new Replicate({ auth: apiToken });
    const output = await replicate.run(depthModel as `${string}/${string}:${string}`, {
      input: { image: base64Source },
    });

    // Extract depth map URL from output
    let depthUrl: string;
    if (output && typeof output === 'object' && !Array.isArray(output) && (output as Record<string, unknown>).grey_depth) {
      depthUrl = String((output as Record<string, unknown>).grey_depth);
    } else if (Array.isArray(output)) {
      depthUrl = String(output[0]);
    } else {
      depthUrl = String(output);
    }

    if (!depthUrl.startsWith('http') && !depthUrl.startsWith('data:')) {
      throw new Error('Depth estimation failed — invalid output');
    }

    // Download depth map
    console.log('[DepthEstimate] Downloading depth map...');
    const depthResponse = await fetch(depthUrl);
    const depthArrayBuffer = await depthResponse.arrayBuffer();
    const depthBuffer = Buffer.from(depthArrayBuffer);

    // Decode depth map to get dimensions and pixel data
    // We'll use canvas-like approach with raw pixel manipulation
    // Since we're in Node.js, use a simpler approach

    // Try to import sharp, fall back to returning raw depth map
    let width: number;
    let height: number;
    let depthBase64: string;
    let normalBase64: string;

    try {
      const sharp = (await import('sharp')).default;

      // Get depth map metadata and resize to max 1024px
      const depthMeta = await sharp(depthBuffer).metadata();
      const maxDim = 1024;
      const maxCurrent = Math.max(depthMeta.width || 512, depthMeta.height || 512);
      const scale = maxCurrent > maxDim ? maxDim / maxCurrent : 1;
      width = Math.round((depthMeta.width || 512) * scale);
      height = Math.round((depthMeta.height || 512) * scale);

      // Resize and normalize depth map
      const preparedDepth = await sharp(depthBuffer)
        .resize(width, height, { fit: 'fill' })
        .normalize()
        .blur(1.2)
        .raw()
        .toBuffer({ resolveWithObject: true });

      const depthPixels = preparedDepth.data;
      const depthChannels = preparedDepth.info.channels;

      // Compute normal map from depth
      console.log('[DepthEstimate] Computing normal map...');
      const normalData = Buffer.alloc(width * height * 3);
      const strength = 6.0;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const getDepth = (px: number, py: number): number => {
            const cx = Math.max(0, Math.min(width - 1, px));
            const cy = Math.max(0, Math.min(height - 1, py));
            return depthPixels[(cy * width + cx) * depthChannels] / 255.0;
          };

          const dX = (
            (getDepth(x + 1, y) - getDepth(x - 1, y)) * 3.0 +
            (getDepth(x + 2, y) - getDepth(x - 2, y)) * 2.0 +
            (getDepth(x + 3, y) - getDepth(x - 3, y)) * 1.0
          ) / 6.0;

          const dY = (
            (getDepth(x, y + 1) - getDepth(x, y - 1)) * 3.0 +
            (getDepth(x, y + 2) - getDepth(x, y - 2)) * 2.0 +
            (getDepth(x, y + 3) - getDepth(x, y - 3)) * 1.0
          ) / 6.0;

          const nx = -dX * strength;
          const ny = -dY * strength;
          const nz = 1.0;
          const len = Math.sqrt(nx * nx + ny * ny + nz * nz);

          const outIdx = (y * width + x) * 3;
          normalData[outIdx] = Math.round(((nx / len) + 1) * 0.5 * 255);
          normalData[outIdx + 1] = Math.round(((ny / len) + 1) * 0.5 * 255);
          normalData[outIdx + 2] = Math.round(((nz / len) + 1) * 0.5 * 255);
        }
      }

      // Convert to PNG base64
      const depthPng = await sharp(depthBuffer)
        .resize(width, height, { fit: 'fill' })
        .png()
        .toBuffer();
      depthBase64 = `data:image/png;base64,${depthPng.toString('base64')}`;

      const normalPng = await sharp(normalData, {
        raw: { width, height, channels: 3 },
      }).png().toBuffer();
      normalBase64 = `data:image/png;base64,${normalPng.toString('base64')}`;

    } catch {
      // If sharp is not available, return depth map as-is without normal map
      console.warn('[DepthEstimate] sharp not available, returning raw depth map');
      width = 512;
      height = 512;
      depthBase64 = `data:image/png;base64,${depthBuffer.toString('base64')}`;
      normalBase64 = depthBase64; // Fallback
    }

    const processingTime = Date.now() - startTime;
    console.log(`[DepthEstimate] Complete in ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      data: {
        depthMapUrl: depthBase64,
        normalMapUrl: normalBase64,
        width,
        height,
        processingTime,
      },
    });
  } catch (error) {
    console.error('[DepthEstimate] Failed:', error);
    const message = error instanceof Error ? error.message : 'Depth estimation failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
