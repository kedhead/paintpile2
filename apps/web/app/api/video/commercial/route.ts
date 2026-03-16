import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import puppeteer from 'puppeteer-core';

export const maxDuration = 120;

interface SlideScript {
  type: 'intro' | 'project' | 'cta' | 'screenshot';
  project_index?: number;
  text_overlay: string;
  narration?: string;
  duration: number;
  url?: string;
  ken_burns?: 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right';
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
  music?: string | false;
  voiceover?: boolean;
}

const FORMAT_DIMENSIONS: Record<string, { width: number; height: number }> = {
  '9:16': { width: 1080, height: 1920 },
  '1:1': { width: 1080, height: 1080 },
  '16:9': { width: 1920, height: 1080 },
};

const BRAND_BG = '#14111e';
const BRAND_PURPLE = '#a78bfa';
const ONEMIN_API_KEY = process.env.ONEMIN_API_KEY || '';
const CHROMIUM_PATH = process.env.CHROMIUM_PATH || '/usr/bin/chromium-browser';

// Ken Burns variants cycle through for variety
const KB_VARIANTS: Array<(d: number, w: number, h: number) => string> = [
  // Zoom in centered
  (d, w, h) =>
    `zoompan=z='min(zoom+0.0012,1.25)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${d * 30}:s=${w}x${h}:fps=30`,
  // Zoom out
  (d, w, h) =>
    `zoompan=z='if(eq(on\\,0)\\,1.25\\,max(zoom-0.0012\\,1.0))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${d * 30}:s=${w}x${h}:fps=30`,
  // Pan left to right
  (d, w, h) =>
    `zoompan=z='1.15':x='if(eq(on\\,0)\\,0\\,min(x+1.5\\,(iw-iw/zoom)))':y='ih/2-(ih/zoom/2)':d=${d * 30}:s=${w}x${h}:fps=30`,
  // Pan right to left
  (d, w, h) =>
    `zoompan=z='1.15':x='if(eq(on\\,0)\\,(iw-iw/zoom)\\,max(x-1.5\\,0))':y='ih/2-(ih/zoom/2)':d=${d * 30}:s=${w}x${h}:fps=30`,
];

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

function runCmd(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args);
    let stderr = '';
    proc.stderr?.on('data', (d) => { stderr += d.toString(); });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited ${code}: ${stderr.slice(-500)}`));
    });
    proc.on('error', reject);
  });
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

// Generate oversized slide (130%) for Ken Burns headroom
async function generateIntroSlide(
  width: number, height: number, textOverlay: string
): Promise<Buffer> {
  const w = Math.round(width * 1.3);
  const h = Math.round(height * 1.3);
  const logoPath = path.join(process.cwd(), 'public', 'logofull.png');
  const bgPath = path.join(process.cwd(), 'public', 'background.png');

  const bgBuffer = await sharp(bgPath).resize(w, h, { fit: 'cover' }).png().toBuffer();
  const logoWidth = Math.round(w * 0.4);
  const logoBuffer = await sharp(logoPath)
    .resize(logoWidth, undefined, { fit: 'inside', withoutEnlargement: true })
    .png().toBuffer();
  const logoMeta = await sharp(logoBuffer).metadata();
  const logoH = logoMeta.height || 200;
  const logoX = Math.round((w - logoWidth) / 2);
  const logoY = Math.round(h * 0.25 - logoH / 2);

  const lines = wrapText(textOverlay, 30);
  const fontSize = Math.round(w * 0.04);
  const lineHeight = fontSize * 1.4;
  const svgLines = lines
    .map((line, i) =>
      `<text x="${w / 2}" y="${Math.round(h * 0.55 + i * lineHeight)}" font-family="sans-serif" font-size="${fontSize}" font-weight="bold" fill="${BRAND_PURPLE}" text-anchor="middle">${escapeXml(line)}</text>`
    ).join('');
  const textSvg = Buffer.from(`<svg width="${w}" height="${h}">${svgLines}</svg>`);

  return sharp(bgBuffer)
    .composite([
      { input: logoBuffer, left: logoX, top: Math.max(0, logoY) },
      { input: textSvg, left: 0, top: 0 },
    ])
    .png().toBuffer();
}

async function generateProjectSlide(
  width: number, height: number, project: ProjectData, textOverlay: string
): Promise<Buffer> {
  const w = Math.round(width * 1.3);
  const h = Math.round(height * 1.3);

  let baseBuffer = await sharp({
    create: { width: w, height: h, channels: 4, background: BRAND_BG },
  }).png().toBuffer();

  let photoBuffer: Buffer | null = null;
  const photoFile = project.cover_photo || (project.photos && project.photos[0]);
  if (photoFile) {
    try {
      const raw = await fetchImage(getPbFileUrl(project, photoFile));
      photoBuffer = await sharp(raw)
        .rotate()
        .resize(Math.round(w * 0.8), Math.round(h * 0.6), { fit: 'inside', withoutEnlargement: true })
        .png().toBuffer();
    } catch { /* continue without photo */ }
  }

  const composites: sharp.OverlayOptions[] = [];
  if (photoBuffer) {
    const meta = await sharp(photoBuffer).metadata();
    composites.push({
      input: photoBuffer,
      left: Math.round((w - (meta.width || 0)) / 2),
      top: Math.round(h * 0.08),
    });
  }

  const barHeight = Math.round(h * 0.22);
  const barY = h - barHeight;
  const barSvg = Buffer.from(
    `<svg width="${w}" height="${h}">
      <rect x="0" y="${barY}" width="${w}" height="${barHeight}" fill="rgba(20,17,30,0.9)"/>
      <text x="${w / 2}" y="${barY + Math.round(barHeight * 0.35)}" font-family="sans-serif" font-size="${Math.round(w * 0.04)}" font-weight="bold" fill="${BRAND_PURPLE}" text-anchor="middle">${escapeXml(textOverlay)}</text>
      <text x="${w / 2}" y="${barY + Math.round(barHeight * 0.6)}" font-family="sans-serif" font-size="${Math.round(w * 0.03)}" fill="#e2e8f0" text-anchor="middle">${escapeXml(project.name)}</text>
      ${project.author_name ? `<text x="${w / 2}" y="${barY + Math.round(barHeight * 0.8)}" font-family="sans-serif" font-size="${Math.round(w * 0.025)}" fill="#94a3b8" text-anchor="middle">by ${escapeXml(project.author_name)}</text>` : ''}
    </svg>`
  );
  composites.push({ input: barSvg, left: 0, top: 0 });

  return sharp(baseBuffer).composite(composites).png().toBuffer();
}

async function generateCtaSlide(
  width: number, height: number, textOverlay: string
): Promise<Buffer> {
  const w = Math.round(width * 1.3);
  const h = Math.round(height * 1.3);
  const bgPath = path.join(process.cwd(), 'public', 'background.png');
  const bgBuffer = await sharp(bgPath).resize(w, h, { fit: 'cover' }).png().toBuffer();

  const fontSize = Math.round(w * 0.05);
  const subSize = Math.round(w * 0.035);
  const svgOverlay = Buffer.from(
    `<svg width="${w}" height="${h}">
      <rect x="0" y="0" width="${w}" height="${h}" fill="rgba(20,17,30,0.6)"/>
      <text x="${w / 2}" y="${Math.round(h * 0.4)}" font-family="sans-serif" font-size="${fontSize}" font-weight="bold" fill="#ffffff" text-anchor="middle">${escapeXml(textOverlay)}</text>
      <text x="${w / 2}" y="${Math.round(h * 0.52)}" font-family="sans-serif" font-size="${subSize}" fill="${BRAND_PURPLE}" text-anchor="middle">thepaintpile.com</text>
    </svg>`
  );

  return sharp(bgBuffer)
    .composite([{ input: svgOverlay, left: 0, top: 0 }])
    .png().toBuffer();
}

async function generateScreenshotSlide(
  width: number, height: number, url: string, textOverlay: string
): Promise<Buffer> {
  const w = Math.round(width * 1.3);
  const h = Math.round(height * 1.3);

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: CHROMIUM_PATH,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      headless: true,
    });
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
    // Wait a bit for any animations
    await new Promise(r => setTimeout(r, 1000));
    const screenshot = await page.screenshot({ type: 'png' });
    await browser.close();
    browser = undefined;

    let screenshotBuffer: Buffer = Buffer.from(new Uint8Array(screenshot));

    // Add text overlay bar at bottom
    if (textOverlay) {
      const barHeight = Math.round(h * 0.12);
      const barY = h - barHeight;
      const overlaySvg = Buffer.from(
        `<svg width="${w}" height="${h}">
          <rect x="0" y="${barY}" width="${w}" height="${barHeight}" fill="rgba(20,17,30,0.85)"/>
          <text x="${w / 2}" y="${barY + Math.round(barHeight * 0.6)}" font-family="sans-serif" font-size="${Math.round(w * 0.03)}" font-weight="bold" fill="${BRAND_PURPLE}" text-anchor="middle">${escapeXml(textOverlay)}</text>
        </svg>`
      );
      screenshotBuffer = await sharp(screenshotBuffer)
        .composite([{ input: overlaySvg, left: 0, top: 0 }])
        .png().toBuffer();
    }

    return screenshotBuffer;
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    // Fallback to CTA-style slide
    return generateCtaSlide(
      Math.round(width), Math.round(height), textOverlay || 'PaintPile'
    );
  }
}

// Generate TTS narration using 1min.ai (OpenAI TTS)
async function generateNarration(text: string, outputPath: string): Promise<void> {
  if (!ONEMIN_API_KEY) {
    throw new Error('ONEMIN_API_KEY not configured');
  }

  const res = await fetch('https://api.1min.ai/api/features', {
    method: 'POST',
    headers: {
      'API-KEY': ONEMIN_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'TEXT_TO_SPEECH',
      model: 'tts-1',
      conversationId: 'TEXT_TO_SPEECH',
      promptObject: {
        text,
        voice: 'nova',
        response_format: 'mp3',
        speed: 1,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`1min.ai TTS failed (${res.status}): ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const fileUrl = data?.aiRecord?.temporaryUrl;
  if (!fileUrl) {
    throw new Error('1min.ai TTS returned no audio URL');
  }

  // Download the audio file
  const audioRes = await fetch(fileUrl);
  if (!audioRes.ok) {
    throw new Error(`Failed to download TTS audio: ${audioRes.status}`);
  }
  const audioBuffer = Buffer.from(await audioRes.arrayBuffer());
  await fs.writeFile(outputPath, audioBuffer);

  // Convert mp3 to wav for consistent ffmpeg handling
  if (outputPath.endsWith('.wav')) {
    await fs.rename(outputPath, outputPath + '.mp3');
    await runCmd('ffmpeg', [
      '-i', outputPath + '.mp3',
      '-ar', '22050', '-ac', '1',
      '-y', outputPath,
    ]);
    await fs.unlink(outputPath + '.mp3').catch(() => {});
  }
}

// Render a single slide with Ken Burns effect into a .mp4 clip
async function renderKenBurnsClip(
  slidePath: string, clipPath: string,
  duration: number, width: number, height: number,
  kbIndex: number
): Promise<void> {
  const kbFilter = KB_VARIANTS[kbIndex % KB_VARIANTS.length](duration, width, height);
  const args = [
    '-i', slidePath,
    '-vf', kbFilter,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-t', String(duration),
    '-y', clipPath,
  ];
  await runCmd('ffmpeg', args);
}

// Concatenate clips with xfade transitions
async function concatenateClips(
  clipPaths: string[], durations: number[], outputPath: string
): Promise<void> {
  if (clipPaths.length === 0) throw new Error('No clips');
  if (clipPaths.length === 1) {
    await fs.copyFile(clipPaths[0], outputPath);
    return;
  }

  const transitionDuration = 0.5;
  const args: string[] = [];
  for (const clip of clipPaths) {
    args.push('-i', clip);
  }

  const filterParts: string[] = [];
  let lastLabel = '[0:v]';
  for (let i = 1; i < clipPaths.length; i++) {
    const offset = durations.slice(0, i).reduce((a, b) => a + b, 0) - transitionDuration * i;
    const outLabel = i === clipPaths.length - 1 ? '[outv]' : `[v${i}]`;
    filterParts.push(
      `${lastLabel}[${i}:v]xfade=transition=fade:duration=${transitionDuration}:offset=${Math.max(0, offset)}${outLabel}`
    );
    lastLabel = outLabel;
  }

  args.push(
    '-filter_complex', filterParts.join(';'),
    '-map', '[outv]',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-y', outputPath,
  );
  await runCmd('ffmpeg', args);
}

// Build combined narration audio track with silence padding per slide
async function buildNarrationTrack(
  slides: SlideScript[], durations: number[], tmpDir: string
): Promise<string | null> {
  const narrationParts: string[] = [];
  let hasAny = false;

  for (let i = 0; i < slides.length; i++) {
    const text = slides[i].narration;
    const partPath = path.join(tmpDir, `narr_${i}.wav`);
    const paddedPath = path.join(tmpDir, `narr_padded_${i}.wav`);

    if (text && text.trim()) {
      await generateNarration(text, partPath);
      // Pad/trim to match slide duration
      await runCmd('ffmpeg', [
        '-i', partPath,
        '-af', `apad=whole_dur=${durations[i]}`,
        '-t', String(durations[i]),
        '-y', paddedPath,
      ]);
      narrationParts.push(paddedPath);
      hasAny = true;
    } else {
      // Generate silence for this slide's duration
      await runCmd('ffmpeg', [
        '-f', 'lavfi', '-i', `anullsrc=r=22050:cl=mono`,
        '-t', String(durations[i]),
        '-y', paddedPath,
      ]);
      narrationParts.push(paddedPath);
    }
  }

  if (!hasAny) return null;

  // Concatenate all narration parts
  const listFile = path.join(tmpDir, 'narr_list.txt');
  await fs.writeFile(listFile, narrationParts.map(p => `file '${p}'`).join('\n'));
  const combinedPath = path.join(tmpDir, 'narration.wav');
  await runCmd('ffmpeg', [
    '-f', 'concat', '-safe', '0', '-i', listFile,
    '-y', combinedPath,
  ]);
  return combinedPath;
}

// Generate background music using 1min.ai Lyria
async function generateBackgroundMusic(outputPath: string): Promise<void> {
  if (!ONEMIN_API_KEY) {
    throw new Error('ONEMIN_API_KEY not configured for music generation');
  }

  const res = await fetch('https://api.1min.ai/api/features', {
    method: 'POST',
    headers: {
      'API-KEY': ONEMIN_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'MUSIC_GENERATOR',
      model: 'lyria-002',
      conversationId: 'MUSIC_GENERATOR',
      promptObject: {
        prompt: 'ambient calm electronic background music, uplifting and modern, soft synth pads, gentle melody, cinematic promotional feel',
        negative_prompt: 'vocals singing lyrics heavy metal screaming distortion',
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`1min.ai music generation failed (${res.status}): ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const fileUrl = data?.temporaryUrl;
  if (!fileUrl) {
    throw new Error('1min.ai music generation returned no audio URL');
  }

  const audioRes = await fetch(fileUrl);
  if (!audioRes.ok) {
    throw new Error(`Failed to download generated music: ${audioRes.status}`);
  }
  const audioBuffer = Buffer.from(await audioRes.arrayBuffer());
  await fs.writeFile(outputPath, audioBuffer);
}

// Mix video + narration + background music
async function mixAudio(
  videoPath: string, narrationPath: string | null, musicTrack: string | false | undefined,
  outputPath: string
): Promise<void> {
  let musicPath: string | null = null;
  let musicExists = false;
  const hasMusic = musicTrack !== false;

  if (hasMusic) {
    const namedPath = musicTrack && musicTrack !== 'none'
      ? path.join(process.cwd(), 'public', 'music', `${musicTrack}.mp3`)
      : path.join(process.cwd(), 'public', 'music', 'ambient-default.mp3');
    try {
      await fs.access(namedPath);
      musicPath = namedPath;
      musicExists = true;
    } catch {
      // No music file found — generate via AI
      if (ONEMIN_API_KEY) {
        const tmpMusic = outputPath.replace('.mp4', '_aigen.wav');
        await generateBackgroundMusic(tmpMusic);
        musicPath = tmpMusic;
        musicExists = true;
      }
    }
  }

  if (!narrationPath && !musicExists) {
    await fs.copyFile(videoPath, outputPath);
    return;
  }

  const args: string[] = ['-i', videoPath];
  const filterParts: string[] = [];
  let audioInputs = 0;

  if (narrationPath) {
    args.push('-i', narrationPath);
    audioInputs++;
    filterParts.push(`[${audioInputs}:a]volume=1.0[vo]`);
  }

  if (musicExists && musicPath) {
    args.push('-stream_loop', '-1', '-i', musicPath);
    audioInputs++;
    const musicVol = narrationPath ? '0.1' : '0.25';
    filterParts.push(`[${audioInputs}:a]volume=${musicVol}[bgm]`);
  }

  // Mix audio streams
  if (narrationPath && musicExists) {
    filterParts.push('[vo][bgm]amix=inputs=2:duration=first[aout]');
  } else if (narrationPath) {
    filterParts.push('[vo]acopy[aout]');
  } else if (musicExists) {
    filterParts.push('[bgm]acopy[aout]');
  }

  args.push(
    '-filter_complex', filterParts.join(';'),
    '-map', '0:v',
    '-map', '[aout]',
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-shortest',
    '-y', outputPath,
  );
  await runCmd('ffmpeg', args);
}

export async function POST(req: NextRequest) {
  try {
    const body: CommercialRequest = await req.json();
    const { projects, script, format, secret, music, voiceover } = body;

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
      // Phase 1: Generate slide images (oversized for Ken Burns)
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
          case 'screenshot':
            slideBuffer = await generateScreenshotSlide(
              width, height, slide.url || 'https://thepaintpile.com', slide.text_overlay
            );
            break;
          case 'cta':
          default:
            slideBuffer = await generateCtaSlide(width, height, slide.text_overlay);
        }

        const slidePath = path.join(tmpDir, `slide_${String(i).padStart(3, '0')}.png`);
        await fs.writeFile(slidePath, slideBuffer);
        slidePaths.push(slidePath);
        durations.push(slide.duration || 5);
      }

      // Phase 2: Render Ken Burns clips
      const clipPaths: string[] = [];
      for (let i = 0; i < slidePaths.length; i++) {
        const clipPath = path.join(tmpDir, `clip_${String(i).padStart(3, '0')}.mp4`);
        const kbType = script[i].ken_burns;
        const kbIndex = kbType
          ? ['zoom_in', 'zoom_out', 'pan_left', 'pan_right'].indexOf(kbType)
          : i; // Auto-cycle through variants
        await renderKenBurnsClip(slidePaths[i], clipPath, durations[i], width, height, kbIndex >= 0 ? kbIndex : i);
        clipPaths.push(clipPath);
      }

      // Phase 3: Concatenate clips with transitions
      const silentVideoPath = path.join(tmpDir, 'video_silent.mp4');
      await concatenateClips(clipPaths, durations, silentVideoPath);

      // Phase 4: Generate narration (if voiceover enabled and narration text provided)
      let narrationPath: string | null = null;
      if (voiceover) {
        narrationPath = await buildNarrationTrack(script, durations, tmpDir);
      }

      // Phase 5: Mix audio (narration + background music)
      const outputPath = path.join(tmpDir, 'commercial.mp4');
      await mixAudio(silentVideoPath, narrationPath, music, outputPath);

      const videoBuffer = await fs.readFile(outputPath);

      return new NextResponse(videoBuffer as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Disposition': `attachment; filename="paintpile-commercial-${format.replace(':', 'x')}.mp4"`,
          'Content-Length': String(videoBuffer.length),
        },
      });
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  } catch (error) {
    console.error('Video commercial error:', error);
    const message = error instanceof Error ? error.message : 'Video generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
