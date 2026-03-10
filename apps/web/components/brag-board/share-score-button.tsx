'use client';

import { useState } from 'react';
import { Share2, Download, Loader2 } from 'lucide-react';
import { useAuth } from '../auth-provider';

interface ShareScoreButtonProps {
  projectId: string;
  projectName: string;
  critique: Record<string, unknown>;
}

export function ShareScoreButton({ projectId, projectName, critique }: ShareScoreButtonProps) {
  const { pb, user } = useAuth();
  const [shared, setShared] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Check if an activity already exists for this project critique
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
        // Update existing activity instead of creating duplicate
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
    try {
      const html2canvas = (await import('html2canvas')).default;
      const element = document.getElementById(`critique-card-${projectId}`);
      if (!element) return;
      const canvas = await html2canvas(element, { backgroundColor: '#14111e' });
      const link = document.createElement('a');
      link.download = `critique-${projectName.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to capture card:', err);
    }
  };

  return (
    <div className="flex items-center gap-2">
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
        ) : (
          <Share2 className="h-3.5 w-3.5" />
        )}
        {shared ? 'Shared!' : 'Share to Feed'}
      </button>
      <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
      >
        <Download className="h-3.5 w-3.5" />
        Save PNG
      </button>
    </div>
  );
}
