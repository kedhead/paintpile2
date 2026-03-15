import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

interface SlideScript {
  type: 'intro' | 'project' | 'cta';
  project_index?: number;
  text_overlay: string;
  duration: number;
}

interface ProjectData {
  id: string;
  collectionId: string;
  name: string;
  author_name?: string;
  cover_photo?: string;
  photos?: string[];
}

interface CommercialRequest {
  projects: ProjectData[];
  script: SlideScript[];
  format: '9:16' | '1:1' | '16:9';
  secret: string;
}

const FORMAT_DIMENSIONS: Record<string, { width: number; height: number }> = {
  '9:16': { width: 1080, height: 1920 },
  '1:1': { width: 1080, height: 1080 },
  '16:9': { width: 1920, height: 1080 },
};

const BRAND_BG = '#14111e';
const BRAND_PURPLE = '#a78bfa';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (test.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function fetchImage(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function getPbFileUrl(project: ProjectData, filename: string): string {
  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
  return `${pbUrl}/api/files/${project.collectionId}/${project.id}/${filename}`;
}

async function generateIntroSlide(
  width: number,
  height: number,
  textOverlay: string
): Promise<Buffer> {
  const logoPath = path.join(process.cwd(), 'public', 'logofull.png');
  const bgPath = path.join(process.cwd(), 'public', 'background.png');

  // Load and resize background to fill
  let bg = sharp(bgPath).resize(width, height, { fit: 'cover' });
  let bgBuffer = await bg.png().toBuffer();

  // Load logo — scale to ~40% of width
  const logoWidth = Math.round(width * 0.4);
  const logoBuffer = await sharp(logoPath)
    .resize(logoWidth, undefined, { fit: 'inside', withoutEnlargement: true })
    .png()
    .toBuffer();
  const logoMeta = await sharp(logoBuffer).metadata();
  const logoH = logoMeta.height || 200;

  // Position logo centered, upper third
  const logoX = Math.round((width - logoWidth) / 2);
  const logoY = Math.round(height * 0.25 - logoH / 2);

  // Tagline SVG
  const lines = wrapText(textOverlay, 30);
  const fontSize = Math.round(width * 0.04);
  const lineHeight = fontSize * 1.4;
  const svgLines = lines
    .map(
      (line, i) =>
        `<text x="${width / 2}" y="${Math.round(height * 0.55 + i * lineHeight)}" font-family="sans-serif" font-size="${fontSize}" font-weight="bold" fill="${BRAND_PURPLE}" text-anchor="middle">${escapeXml(line)}</text>`
    )
    .join('');
  const textSvg = Buffer.from(
    `<svg width="${width}" height="${height}">${svgLines}</svg>`
  );

  return sharp(bgBuffer)
    .composite([
      { input: logoBuffer, left: logoX, top: Math.max(0, logoY) },
      { input: textSvg, left: 0, top: 0 },
    ])
    .png()
    .toBuffer();
}

async function generateProjectSlide(
  width: number,
  height: number,
  project: ProjectData,
  textOverlay: string
): Promise<Buffer> {
  // Start with brand background
  let base = sharp({
    create: { width, height, channels: 4, background: BRAND_BG },
  }).png();
  let baseBuffer = await base.toBuffer();

  // Try to get project photo
  let photoBuffer: Buffer | null = null;
  const photoFile = project.cover_photo || (project.photos && project.photos[0]);
  if (photoFile) {
    try {
      const url = getPbFileUrl(project, photoFile);
      const raw = await fetchImage(url);
      // Resize photo to fit ~80% of the canvas
      const targetW = Math.round(width * 0.8);
      const targetH = Math.round(height * 0.6);
      photoBuffer = await sharp(raw)
        .resize(targetW, targetH, { fit: 'inside', withoutEnlargement: true })
        .png()
        .toBuffer();
    } catch {
      // Continue without photo
    }
  }

  const composites: sharp.OverlayOptions[] = [];

  if (photoBuffer) {
    const meta = await sharp(photoBuffer).metadata();
    const pw = meta.width || 0;
    const ph = meta.height || 0;
    composites.push({
      input: photoBuffer,
      left: Math.round((width - pw) / 2),
      top: Math.round(height * 0.08),
    });
  }

  // Caption bar at bottom
  const barHeight = Math.round(height * 0.22);
  const barY = height - barHeight;
  const barSvg = Buffer.from(
    `<svg width="${width}" height="${height}">
      <rect x="0" y="${barY}" width="${width}" height="${barHeight}" fill="rgba(20,17,30,0.9)"/>
      <text x="${width / 2}" y="${barY + Math.round(barHeight * 0.35)}" font-family="sans-serif" font-size="${Math.round(width * 0.04)}" font-weight="bold" fill="${BRAND_PURPLE}" text-anchor="middle">${escapeXml(textOverlay)}</text>
      <text x="${width / 2}" y="${barY + Math.round(barHeight * 0.6)}" font-family="sans-serif" font-size="${Math.round(width * 0.03)}" fill="#e2e8f0" text-anchor="middle">${escapeXml(project.name)}</text>
      ${project.author_name ? `<text x="${width / 2}" y="${barY + Math.round(barHeight * 0.8)}" font-family="sans-serif" font-size="${Math.round(width * 0.025)}" fill="#94a3b8" text-anchor="middle">by ${escapeXml(project.author_name)}</text>` : ''}
    </svg>`
  );
  composites.push({ input: barSvg, left: 0, top: 0 });

  return sharp(baseBuffer).composite(composites).png().toBuffer();
}

async function generateCtaSlide(
  width: number,
  height: number,
  textOverlay: string
): Promise<Buffer> {
  const bgPath = path.join(process.cwd(), 'public', 'background.png');
  const bgBuffer = await sharp(bgPath)
    .resize(width, height, { fit: 'cover' })
    .png()
    .toBuffer();

  const fontSize = Math.round(width * 0.05);
  const subSize = Math.round(width * 0.035);

  const svgOverlay = Buffer.from(
    `<svg width="${width}" height="${height}">
      <rect x="0" y="0" width="${width}" height="${height}" fill="rgba(20,17,30,0.6)"/>
      <text x="${width / 2}" y="${Math.round(height * 0.4)}" font-family="sans-serif" font-size="${fontSize}" font-weight="bold" fill="#ffffff" text-anchor="middle">${escapeXml(textOverlay)}</text>
      <text x="${width / 2}" y="${Math.round(height * 0.52)}" font-family="sans-serif" font-size="${subSize}" fill="${BRAND_PURPLE}" text-anchor="middle">thepaintpile.com</text>
    </svg>`
  );

  return sharp(bgBuffer)
    .composite([{ input: svgOverlay, left: 0, top: 0 }])
    .png()
    .toBuffer();
}

function assembleVideo(
  slidePaths: string[],
  durations: number[],
  outputPath: string,
  width: number,
  height: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Build ffmpeg command with xfade transitions between slides
    const transitionDuration = 0.5;

    if (slidePaths.length === 0) {
      return reject(new Error('No slides to assemble'));
    }

    if (slidePaths.length === 1) {
      // Single slide — just convert image to video
      const args = [
        '-loop', '1',
        '-i', slidePaths[0],
        '-t', String(durations[0]),
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-r', '30',
        '-vf', `scale=${width}:${height}`,
        '-y', outputPath,
      ];
      const proc = spawn('ffmpeg', args);
      proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
      proc.on('error', reject);
      return;
    }

    // Multiple slides with xfade transitions
    const args: string[] = [];

    // Add all inputs as image loops
    for (let i = 0; i < slidePaths.length; i++) {
      args.push('-loop', '1', '-t', String(durations[i] + transitionDuration), '-i', slidePaths[i]);
    }

    // Build xfade filter chain
    let filterParts: string[] = [];
    let lastLabel = '[0:v]';

    for (let i = 1; i < slidePaths.length; i++) {
      const offset = durations.slice(0, i).reduce((a, b) => a + b, 0) - transitionDuration * i;
      const outLabel = i === slidePaths.length - 1 ? '[outv]' : `[v${i}]`;
      filterParts.push(
        `${lastLabel}[${i}:v]xfade=transition=fade:duration=${transitionDuration}:offset=${Math.max(0, offset)}${outLabel}`
      );
      lastLabel = outLabel;
    }

    const filterComplex = filterParts.join(';');

    args.push(
      '-filter_complex', filterComplex,
      '-map', '[outv]',
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-r', '30',
      '-y', outputPath,
    );

    const proc = spawn('ffmpeg', args);
    let stderr = '';
    proc.stderr?.on('data', (d) => { stderr += d.toString(); });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-500)}`));
    });
    proc.on('error', reject);
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: CommercialRequest = await req.json();
    const { projects, script, format, secret } = body;

    // Validate secret
    const expectedSecret = process.env.VIDEO_API_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!script || !Array.isArray(script) || script.length === 0) {
      return NextResponse.json({ error: 'Script is required' }, { status: 400 });
    }

    const dims = FORMAT_DIMENSIONS[format];
    if (!dims) {
      return NextResponse.json(
        { error: `Invalid format. Use: ${Object.keys(FORMAT_DIMENSIONS).join(', ')}` },
        { status: 400 }
      );
    }

    const { width, height } = dims;
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'paintpile-video-'));

    try {
      // Generate slide images
      const slidePaths: string[] = [];
      const durations: number[] = [];

      for (let i = 0; i < script.length; i++) {
        const slide = script[i];
        let slideBuffer: Buffer;

        switch (slide.type) {
          case 'intro':
            slideBuffer = await generateIntroSlide(width, height, slide.text_overlay);
            break;
          case 'project': {
            const project = projects[slide.project_index ?? 0];
            if (!project) {
              slideBuffer = await generateCtaSlide(width, height, slide.text_overlay);
            } else {
              slideBuffer = await generateProjectSlide(width, height, project, slide.text_overlay);
            }
            break;
          }
          case 'cta':
            slideBuffer = await generateCtaSlide(width, height, slide.text_overlay);
            break;
          default:
            slideBuffer = await generateCtaSlide(width, height, slide.text_overlay);
        }

        const slidePath = path.join(tmpDir, `slide_${String(i).padStart(3, '0')}.png`);
        await fs.writeFile(slidePath, slideBuffer);
        slidePaths.push(slidePath);
        durations.push(slide.duration || 5);
      }

      // Assemble into MP4
      const outputPath = path.join(tmpDir, 'commercial.mp4');
      await assembleVideo(slidePaths, durations, outputPath, width, height);

      // Read the output video
      const videoBuffer = await fs.readFile(outputPath);

      return new NextResponse(videoBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Disposition': `attachment; filename="paintpile-commercial-${format.replace(':', 'x')}.mp4"`,
          'Content-Length': String(videoBuffer.length),
        },
      });
    } finally {
      // Cleanup temp files
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  } catch (error) {
    console.error('Video commercial error:', error);
    const message = error instanceof Error ? error.message : 'Video generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
