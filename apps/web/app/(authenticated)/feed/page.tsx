'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../components/auth-provider';
import { useDiscoverFeed, useFollowingFeed } from '../../../hooks/use-posts';
import { useFollowingIds } from '../../../hooks/use-follows';
import { useLiveStreams } from '../../../hooks/use-live-streams';
import { CreatePostForm } from '../../../components/feed/create-post-form';
import { PostCard } from '../../../components/feed/post-card';
import { FeedTabs } from '../../../components/feed/feed-tabs';
import { GoLiveButton } from '../../../components/feed/go-live-button';
import { LiveStreamCard } from '../../../components/feed/live-stream-card';

export default function FeedPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'following' | 'discover'>('discover');
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data: followingIds = [] } = useFollowingIds(user?.id || '');
  const discover = useDiscoverFeed();
  const following = useFollowingFeed(followingIds);
  const { data: liveStreams = [] } = useLiveStreams();

  const feed = activeTab === 'discover' ? discover : following;
  const posts = feed.data?.pages.flatMap((p) => p.items) || [];

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && feed.hasNextPage && !feed.isFetchingNextPage) {
        feed.fetchNextPage();
      }
    },
    [feed]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Create post + Go Live row */}
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <CreatePostForm />
        </div>
        <div className="pt-1">
          <GoLiveButton />
        </div>
      </div>

      {/* Live Streams */}
      {liveStreams.length > 0 && (
        <div className="space-y-2">
          {liveStreams.map((stream) => (
            <LiveStreamCard key={stream.id} stream={stream} />
          ))}
        </div>
      )}

      <div className="rounded-lg border border-border bg-card">
        <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="space-y-4">
        {feed.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              {activeTab === 'following'
                ? 'Follow some painters to see their posts here!'
                : 'No posts yet. Be the first to share!'}
            </p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-4" />
        {feed.isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}
