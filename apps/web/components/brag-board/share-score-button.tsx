'use client';

import { useState } from 'react';
import { Share2, Download, Loader2, Check } from 'lucide-react';
import { useAuth } from '../auth-provider';
import { CritiqueShowcaseCard } from '../ai/critique-showcase-card';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thepaintpile.com';

interface ShareScoreButtonProps {
  projectId: string;
  projectName: string;
  critique: Record<string, unknown>;
  imageUrl?: string | null;
}

export function ShareScoreButton({ projectId, projectName, critique, imageUrl }: ShareScoreButtonProps) {
  const { pb, user } = useAuth();
  const [shared, setShared] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const cardId = `showcase-card-${projectId}`;
  const shareUrl = `${SITE_URL}/share/project/${projectId}`;
  const shareText = `My "${projectName}" just got a ${critique.grade} (${critique.score}/100) from AI critique on Paintpile!`;

  const handleShare = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const existing = await pb.collection('activities').getList(1, 1, {
        filter: `user="${user.id}" && type="project_critique_shared" && target_id="${projectId}"`,
        requestKey: null,
      });

      const payload = {
        user: user.id,
        type: 'project_critique_shared',
        target_id: projectId,
        target_type: 'project',
        metadata: JSON.stringify({ project_name: projectName, critique }),
        visibility: 'public',
      };

      if (existing.items.length > 0) {
        await pb.collection('activities').update(existing.items[0].id, payload);
      } else {
        await pb.collection('activities').create(payload);
      }
      setShared(true);
    } catch (err) {
      console.error('Share failed:', err);
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    setDownloading(true);
    setShowCard(true);
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
      link.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}-critique.png`;
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
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
  };

  const handleShareReddit = () => {
    window.open(
      `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
      '_blank'
    );
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleShare}
          disabled={shared || loading}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
            shared
              ? 'bg-green-500/20 text-green-400'
              : 'border border-border bg-card text-foreground hover:bg-muted'
          }`}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : shared ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Share2 className="h-3.5 w-3.5" />
          )}
          {shared ? 'Shared!' : 'Share to Feed'}
        </button>

        <button
          onClick={handleDownload}
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

      {/* Offscreen showcase card for PNG capture */}
      {showCard && (
        <div className="fixed -left-[9999px] -top-[9999px]">
          <CritiqueShowcaseCard
            cardId={cardId}
            projectName={projectName}
            critique={critique as unknown as Parameters<typeof CritiqueShowcaseCard>[0]['critique']}
            imageUrl={imageUrl}
          />
        </div>
      )}
    </>
  );
}
