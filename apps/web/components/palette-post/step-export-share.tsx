'use client';

import { useState, useEffect } from 'react';
import { Download, Save, Link2, Check, Copy, Loader2 } from 'lucide-react';
import { CardPreview } from './card-preview';
import { generateCaption } from '../../lib/caption-generator';
import { useCreatePalettePost } from '../../hooks/use-palette-posts';
import type { PalettePostData } from '../../lib/palette-post-types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thepaintpile.com';

interface StepExportShareProps {
  data: PalettePostData;
  onChange: (updates: Partial<PalettePostData>) => void;
}

export function StepExportShare({ data, onChange }: StepExportShareProps) {
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showExportCard, setShowExportCard] = useState(false);
  const createPost = useCreatePalettePost();

  // Auto-generate caption on mount if empty
  useEffect(() => {
    if (!data.caption && data.paints.length > 0) {
      onChange({ caption: generateCaption(data.paints, data.title) });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const captureCard = async (): Promise<Blob | null> => {
    setShowExportCard(true);
    await new Promise((r) => setTimeout(r, 300));

    try {
      const html2canvas = (await import('html2canvas')).default;
      const element = document.getElementById('palette-post-export');
      if (!element) return null;

      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 1,
        useCORS: true,
      });

      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      });
    } catch (err) {
      console.error('Failed to capture card:', err);
      return null;
    } finally {
      setShowExportCard(false);
    }
  };

  const handleDownloadPNG = async () => {
    setDownloading(true);
    try {
      const blob = await captureCard();
      if (!blob) return;

      const link = document.createElement('a');
      link.download = `palette-${data.title.replace(/\s+/g, '-').toLowerCase() || 'post'}.png`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    } finally {
      setDownloading(false);
    }
  };

  const handleSaveToGallery = async () => {
    setSaving(true);
    try {
      const blob = await captureCard();
      const mediaFiles = data.media
        .filter((m) => m.file)
        .map((m) => m.file!);

      const result = await createPost.mutateAsync({
        ...data,
        imageBlob: blob || undefined,
        mediaFiles: mediaFiles.length > 0 ? mediaFiles : undefined,
      });

      setSaved(true);
      setSavedId(result.id);
    } catch (err) {
      console.error('Failed to save:', err);
      alert('Failed to save palette post');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(data.caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = data.caption;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Preview */}
      <div className="flex flex-1 items-start justify-center">
        <div className="overflow-hidden rounded-xl border border-border shadow-lg">
          <CardPreview data={data} size={480} />
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-5 lg:w-80">
        {/* Caption */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">Caption</label>
            <button
              onClick={handleCopyCaption}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <textarea
            value={data.caption}
            onChange={(e) => onChange({ caption: e.target.value })}
            rows={6}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* Sharing toggle */}
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium text-foreground">Public sharing</p>
            <p className="text-xs text-muted-foreground">Allow anyone with the link to view</p>
          </div>
          <button
            onClick={() => onChange({ is_public: !data.is_public })}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              data.is_public ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                data.is_public ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {saved && savedId && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3">
            <p className="text-sm font-medium text-green-400">Saved!</p>
            {data.is_public && (
              <p className="mt-1 break-all text-xs text-green-400/70">
                {SITE_URL}/share/palette-post/{savedId}
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleDownloadPNG}
            disabled={downloading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download PNG
          </button>

          <button
            onClick={handleSaveToGallery}
            disabled={saving || saved}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saved ? 'Saved to Gallery' : 'Save to Gallery'}
          </button>
        </div>
      </div>

      {/* Offscreen export card at 1080x1080 */}
      {showExportCard && (
        <div className="fixed -left-[9999px] -top-[9999px]">
          <CardPreview data={data} cardId="palette-post-export" size={1080} />
        </div>
      )}
    </div>
  );
}
