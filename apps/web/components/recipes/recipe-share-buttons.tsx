'use client';

import { useState } from 'react';
import { Share2, Download, Link2, Check, Loader2 } from 'lucide-react';
import type { RecordModel } from 'pocketbase';
import { RecipeShareCard } from './recipe-share-card';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thepaintpile.com';

interface RecipeShareButtonsProps {
  recipe: RecordModel;
}

export function RecipeShareButtons({ recipe }: RecipeShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const shareUrl = `${SITE_URL}/share/recipe/${recipe.id}`;
  const cardId = `recipe-share-card-${recipe.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPNG = async () => {
    setDownloading(true);
    setShowCard(true);

    // Wait for card to render
    await new Promise((r) => setTimeout(r, 200));

    try {
      const html2canvas = (await import('html2canvas')).default;
      const element = document.getElementById(cardId);
      if (!element) return;
      const canvas = await html2canvas(element, {
        backgroundColor: '#14111e',
        scale: 1,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `recipe-${recipe.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to capture card:', err);
    } finally {
      setDownloading(false);
      setShowCard(false);
    }
  };

  const handleShareTwitter = () => {
    const text = `Check out this painting recipe: ${recipe.name}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
  };

  const handleShareReddit = () => {
    window.open(
      `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(recipe.name)}`,
      '_blank'
    );
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleCopyLink}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
            copied
              ? 'bg-green-500/20 text-green-400'
              : 'border border-border bg-card text-foreground hover:bg-muted'
          }`}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>

        <button
          onClick={handleDownloadPNG}
          disabled={downloading}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
        >
          {downloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          Save PNG
        </button>

        <button
          onClick={handleShareTwitter}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
        >
          <Share2 className="h-3.5 w-3.5" />
          Twitter
        </button>

        <button
          onClick={handleShareReddit}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
        >
          <Share2 className="h-3.5 w-3.5" />
          Reddit
        </button>
      </div>

      {/* Offscreen share card for PNG capture */}
      {showCard && (
        <div className="fixed -left-[9999px] -top-[9999px]">
          <RecipeShareCard recipe={recipe} cardId={cardId} />
        </div>
      )}
    </>
  );
}
