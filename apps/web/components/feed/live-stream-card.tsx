'use client';

import { useState, useCallback } from 'react';
import type { RecordModel } from 'pocketbase';
import { Radio, Eye, Loader2 } from 'lucide-react';
import { getDisplayName } from '@paintpile/shared';
import { UserAvatar } from '../social/user-avatar';
import { LiveStreamViewer } from './live-stream-viewer';
import { useAuth } from '../auth-provider';
import { relativeTime } from '../../lib/pb-helpers';

interface LiveStreamCardProps {
  stream: RecordModel;
}

export function LiveStreamCard({ stream }: LiveStreamCardProps) {
  const { user, pb } = useAuth();
  const author = stream.expand?.user as RecordModel | undefined;
  const [viewing, setViewing] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  const handleWatch = useCallback(async () => {
    if (!livekitUrl || !user) return;
    setConnecting(true);

    try {
      const res = await fetch('/api/livekit/feed-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamerId: stream.user,
          pbToken: pb.authStore.token,
          role: 'viewer',
        }),
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        setViewing(true);
      }
    } catch (err) {
      console.error('Failed to join stream:', err);
    } finally {
      setConnecting(false);
    }
  }, [livekitUrl, user, stream.user, pb.authStore.token]);

  const handleLeave = () => {
    setViewing(false);
    setToken(null);
  };

  return (
    <>
      <article className="group relative overflow-hidden rounded-lg border border-red-500/30 bg-gradient-to-r from-red-500/5 via-card to-card p-4 transition-all hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/5">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {author && <UserAvatar user={author} size="md" />}

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {author && (
                <span className="text-sm font-medium text-foreground">
                  {getDisplayName(author)}
                </span>
              )}
              <span className="flex items-center gap-1 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white animate-pulse">
                <Radio className="h-2.5 w-2.5" />
                Live
              </span>
            </div>
            <p className="truncate text-sm text-muted-foreground">{stream.title}</p>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <Eye className="h-3 w-3" />
                {stream.viewer_count || 0}
              </span>
              <span>•</span>
              <span>Started {relativeTime(stream.created)}</span>
            </div>
          </div>

          {/* Watch button */}
          <button
            onClick={handleWatch}
            disabled={connecting || !livekitUrl}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {connecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            Watch
          </button>
        </div>

        {/* Decorative red glow line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
      </article>

      {/* Viewer modal */}
      {viewing && token && livekitUrl && (
        <LiveStreamViewer
          livekitUrl={livekitUrl}
          token={token}
          streamerName={author ? getDisplayName(author) : 'Streamer'}
          title={stream.title}
          onLeave={handleLeave}
        />
      )}
    </>
  );
}
