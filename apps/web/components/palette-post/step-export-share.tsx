'use client';

import { useState, useEffect } from 'react';
import { Download, Save, Check, Copy, Loader2, Images, Sparkles, Link2 } from 'lucide-react';
import { CarouselPreview, buildCards } from './carousel-preview';
import { TutorialCard } from './tutorial-card';
import { generateCaption } from '../../lib/caption-generator';
import { useCreatePalettePost } from '../../hooks/use-palette-posts';
import { useAuth } from '../auth-provider';
import type { PalettePostData } from '../../lib/palette-post-types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thepaintpile.com';
const EXPORT_SIZE = 1080;

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
  const [copiedLink, setCopiedLink] = useState(false);
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const createPost = useCreatePalettePost();
  const { pb } = useAuth();

  const cards = buildCards(data);

  // Auto-generate caption on mount if empty
  useEffect(() => {
    if (!data.caption && data.paints.length > 0) {
      onChange({ caption: generateCaption(data.paints, data.title) });
    } else if (!data.caption && data.title) {
      onChange({ caption: `${data.title}\n\n#miniaturepainting #warhammer #paintpile` });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const captureCard = async (cardIndex: number): Promise<Blob | null> => {
    const containerId = `palette-export-card-${cardIndex}`;
    const element = document.getElementById(containerId);
    if (!element) return null;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 1,
        useCORS: true,
        logging: false,
        width: EXPORT_SIZE,
        height: EXPORT_SIZE,
      });
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      });
    } catch (err) {
      console.error('Failed to capture card:', err);
      return null;
    }
  };

  const handleDownloadAll = async () => {
    setDownloading(true);
    try {
      const slug = data.title.replace(/\s+/g, '-').toLowerCase() || 'palette';
      for (let i = 0; i < cards.length; i++) {
        const blob = await captureCard(i);
        if (!blob) continue;
        const link = document.createElement('a');
        link.download = `${slug}-${i + 1}-of-${cards.length}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        // Small delay between downloads
        if (i < cards.length - 1) await new Promise((r) => setTimeout(r, 300));
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleSaveToGallery = async () => {
    setSaving(true);
    try {
      // Capture cover card (index 0) as the representative image
      const blob = await captureCard(0);
      const mediaFiles = data.media.filter((m) => m.file).map((m) => m.file!);

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
    } catch {
      const ta = document.createElement('textarea');
      ta.value = data.caption;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = savedId ? `${SITE_URL}/share/palette-post/${savedId}` : null;

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleGenerateCaption = async () => {
    setGeneratingCaption(true);
    try {
      const res = await fetch('/api/ai/palette-post-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          paints: data.paints,
          steps: data.steps.map((s) => ({ description: s.description })),
          pbToken: pb.authStore.token,
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.caption) {
        onChange({ caption: json.data.caption });
      } else {
        alert(json.error || 'Caption generation failed');
      }
    } catch {
      alert('Caption generation failed');
    } finally {
      setGeneratingCaption(false);
    }
  };

  const hasVideo = cards.some((c) => c.imageFile?.type.startsWith('video/'));

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Carousel preview */}
      <div className="flex flex-1 items-start justify-center">
        <div className="w-full max-w-[460px]">
          <p className="mb-3 text-center text-xs text-muted-foreground">
            {cards.length} card{cards.length !== 1 ? 's' : ''} — each downloads as a separate PNG
          </p>
          <CarouselPreview data={data} size={370} />
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-5 lg:w-80">
        {/* Caption */}
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label className="text-xs font-semibold text-foreground">Caption</label>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateCaption}
                disabled={generatingCaption}
                className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 disabled:opacity-50"
              >
                {generatingCaption ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                {generatingCaption ? 'Generating…' : 'AI Caption'}
              </button>
              <button
                onClick={handleCopyCaption}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <textarea
            value={data.caption}
            onChange={(e) => onChange({ caption: e.target.value })}
            rows={5}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* Public toggle */}
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium text-foreground">Public sharing</p>
            <p className="text-xs text-muted-foreground">Anyone with the link can view</p>
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
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 space-y-2">
            <p className="text-sm font-medium text-green-400">Saved to gallery!</p>
            {data.is_public && shareUrl && (
              <>
                <p className="break-all text-xs text-green-400/70">{shareUrl}</p>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 rounded-md bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/30 w-full justify-center"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                  {copiedLink ? 'Link copied!' : 'Copy share link'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          {/* Save first — always the primary action */}
          <button
            onClick={handleSaveToGallery}
            disabled={saving || saved}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
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

          <button
            onClick={handleDownloadAll}
            disabled={downloading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : cards.length > 1 ? (
              <Images className="h-4 w-4" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {downloading
              ? 'Downloading…'
              : cards.length > 1
              ? `Download ${cards.length} PNGs${hasVideo ? ' (videos as thumbnails)' : ''}`
              : 'Download PNG'}
          </button>
        </div>
      </div>

      {/* Off-screen export cards at 1080×1080 */}
      <div style={{ position: 'fixed', left: -9999, top: -9999, overflow: 'visible' }}>
        {cards.map((card, i) => {
          // For video files, skip imageFile and use the thumbnail stored in imageUrl instead
          const isVideo = card.imageFile?.type.startsWith('video/');
          return (
            <TutorialCard
              key={i}
              cardId={`palette-export-card-${i}`}
              type={card.type}
              title={card.title}
              stepNumber={card.stepNumber}
              description={card.description}
              imageFile={isVideo ? undefined : card.imageFile}
              imageUrl={card.imageUrl}
              paints={card.paints}
              attribution={data.attribution || 'paintpile.com'}
              currentCardIndex={i}
              totalCards={cards.length}
              cardBg={data.background_color || '#ffffff'}
              size={EXPORT_SIZE}
            />
          );
        })}
      </div>
    </div>
  );
}
