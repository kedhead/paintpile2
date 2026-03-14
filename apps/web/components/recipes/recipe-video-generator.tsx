'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Film, Loader2, Play, Download, X, Sparkles } from 'lucide-react';
import type { RecordModel } from 'pocketbase';
import { OPERATION_COSTS } from '@paintpile/shared';
import { useRecipeVideoScript } from '../../hooks/use-ai';
import { useRecipeMedia } from '../../hooks/use-recipe-media';
import { getFileUrl } from '../../lib/pb-helpers';

interface ScriptEntry {
  step_index: number;
  narration: string;
  duration_seconds: number;
  text_overlay: string;
}

interface RecipeVideoGeneratorProps {
  recipe: RecordModel;
}

function parseJSON<T>(value: unknown, fallback: T): T {
  if (Array.isArray(value)) return value as T;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export function RecipeVideoGenerator({ recipe }: RecipeVideoGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [script, setScript] = useState<ScriptEntry[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoScriptMutation = useRecipeVideoScript();

  const { data: allMedia } = useRecipeMedia(recipe.id);

  const steps = parseJSON<{ id?: string; title?: string; instruction: string; estimated_time: number }[]>(
    recipe.steps,
    []
  );

  // Group media by step_id, pick first image per step
  const stepImages: Record<string, string> = {};
  (allMedia || []).forEach((m) => {
    if (!stepImages[m.step_id]) {
      stepImages[m.step_id] = getFileUrl(m, m.image);
    }
  });

  // Cover image as fallback
  const coverUrl = recipe.cover_image ? getFileUrl(recipe, recipe.cover_image) : null;

  const handleGenerateScript = async () => {
    const recipeData = {
      name: recipe.name,
      description: recipe.description,
      category: recipe.category,
      difficulty: recipe.difficulty,
      ingredients: parseJSON(recipe.ingredients, []),
      steps: steps.map((s, i) => ({
        stepNumber: i + 1,
        title: s.title || `Step ${i + 1}`,
        instruction: s.instruction,
        estimated_time: s.estimated_time,
      })),
      techniques: parseJSON(recipe.techniques, []),
    };

    const result = await videoScriptMutation.mutateAsync({ recipe: recipeData });
    setScript(result.data.script);
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const handleGenerateVideo = useCallback(async () => {
    if (!script || !canvasRef.current) return;

    setGenerating(true);
    setProgress('Preparing canvas...');

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1280;
    canvas.height = 720;

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2500000,
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setGenerating(false);
      setProgress('');
    };

    recorder.start();

    // Preload all images
    const imageCache: Record<string, HTMLImageElement> = {};
    for (const entry of script) {
      let imgSrc: string | null = null;
      if (entry.step_index === -1 || entry.step_index === -2) {
        imgSrc = coverUrl;
      } else if (entry.step_index >= 0 && entry.step_index < steps.length) {
        const step = steps[entry.step_index];
        imgSrc = stepImages[step.id || ''] || coverUrl;
      }
      if (imgSrc && !imageCache[imgSrc]) {
        try {
          imageCache[imgSrc] = await loadImage(imgSrc);
        } catch {
          // skip failed images
        }
      }
    }

    // Render each slide
    for (let i = 0; i < script.length; i++) {
      const entry = script[i];
      setProgress(`Rendering slide ${i + 1}/${script.length}...`);

      // Determine image
      let imgSrc: string | null = null;
      if (entry.step_index === -1 || entry.step_index === -2) {
        imgSrc = coverUrl;
      } else if (entry.step_index >= 0 && entry.step_index < steps.length) {
        const step = steps[entry.step_index];
        imgSrc = stepImages[step.id || ''] || coverUrl;
      }

      // Draw background
      ctx.fillStyle = '#14111e';
      ctx.fillRect(0, 0, 1280, 720);

      // Draw image
      if (imgSrc && imageCache[imgSrc]) {
        const img = imageCache[imgSrc];
        const scale = Math.min(1280 / img.width, 720 / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.globalAlpha = 0.6;
        ctx.drawImage(img, (1280 - w) / 2, (720 - h) / 2, w, h);
        ctx.globalAlpha = 1;
      }

      // Semi-transparent overlay at bottom
      ctx.fillStyle = 'rgba(20, 17, 30, 0.85)';
      ctx.fillRect(0, 520, 1280, 200);

      // Text overlay (large)
      ctx.fillStyle = '#a78bfa';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(entry.text_overlay, 640, 580);

      // Narration text (smaller)
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '20px sans-serif';
      const words = entry.narration.split(' ');
      let line = '';
      let y = 620;
      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        if (ctx.measureText(testLine).width > 1100) {
          ctx.fillText(line, 640, y);
          line = word;
          y += 28;
        } else {
          line = testLine;
        }
      }
      if (line) ctx.fillText(line, 640, y);

      // Step number badge (if applicable)
      if (entry.step_index >= 0) {
        ctx.fillStyle = '#a78bfa';
        ctx.beginPath();
        ctx.arc(80, 60, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(entry.step_index + 1), 80, 68);
      }

      // Hold the frame for the specified duration
      const fps = 30;
      const totalFrames = entry.duration_seconds * fps;
      for (let f = 0; f < totalFrames; f++) {
        await new Promise((r) => setTimeout(r, 1000 / fps));
      }
    }

    recorder.stop();
  }, [script, coverUrl, stepImages, steps]);

  const handleDownload = () => {
    if (!videoUrl) return;
    const link = document.createElement('a');
    link.download = `recipe-${recipe.name.replace(/\s+/g, '-').toLowerCase()}.webm`;
    link.href = videoUrl;
    link.click();
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
      >
        <Film className="h-3.5 w-3.5" />
        Generate Video
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Recipe Video Generator</h3>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Generate an AI-narrated slideshow video from your recipe steps and images.
      </p>

      {/* Step 1: Generate script */}
      {!script && (
        <button
          type="button"
          onClick={handleGenerateScript}
          disabled={videoScriptMutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
        >
          {videoScriptMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating script...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Narration Script ({OPERATION_COSTS.recipeVideoScript} credits)
            </>
          )}
        </button>
      )}

      {videoScriptMutation.isError && (
        <p className="text-xs text-red-400">
          {videoScriptMutation.error?.message || 'Failed to generate script'}
        </p>
      )}

      {/* Step 2: Preview script */}
      {script && !videoUrl && (
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground">Narration Script</h4>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {script.map((entry, i) => (
              <div
                key={i}
                className="rounded border border-border bg-muted/50 px-3 py-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    {entry.step_index === -1
                      ? 'Intro'
                      : entry.step_index === -2
                        ? 'Closing'
                        : `Step ${entry.step_index + 1}`}
                  </span>
                  <span className="text-muted-foreground">{entry.duration_seconds}s</span>
                </div>
                <p className="mt-1 text-primary">{entry.text_overlay}</p>
                <p className="mt-0.5 text-muted-foreground">{entry.narration}</p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleGenerateVideo}
            disabled={generating}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {progress || 'Generating...'}
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Generate Slideshow Video
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 3: Preview + download */}
      {videoUrl && (
        <div className="space-y-3">
          <video
            src={videoUrl}
            controls
            className="w-full rounded-lg"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
            >
              <Download className="h-4 w-4" />
              Download WebM
            </button>
            <button
              type="button"
              onClick={() => {
                setScript(null);
                setVideoUrl(null);
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              Start Over
            </button>
          </div>
        </div>
      )}

      {/* Hidden canvas for video generation */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
