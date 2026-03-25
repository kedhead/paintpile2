'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../components/auth-provider';
import { useDiscoverFeed, useFollowingFeed } from '../../../hooks/use-posts';
import { useFollowingIds } from '../../../hooks/use-follows';
import { useLiveStreams } from '../../../hooks/use-live-streams';
import { CreatePostForm } from '../../../components/feed/create-post-form';
import { PostCard } from '../../../components/feed/post-card';
import { AdCard } from '../../../components/feed/ad-card';
import { useActiveAds } from '../../../hooks/use-ads';
import { FeedTabs, type FeedTab } from '../../../components/feed/feed-tabs';
import { GoLiveButton } from '../../../components/feed/go-live-button';
import { LiveStreamCard } from '../../../components/feed/live-stream-card';
import { CommunityGallery } from '../../../components/community/community-gallery';
import { PeopleSearch } from '../../../components/feed/people-search';

function FeedContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as FeedTab) || 'discover';
  const [activeTab, setActiveTab] = useState<FeedTab>(
    (['following', 'discover', 'gallery', 'people'] as FeedTab[]).includes(initialTab) ? initialTab : 'discover'
  );
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data: followingIds = [] } = useFollowingIds(user?.id || '');
  const discover = useDiscoverFeed();
  const following = useFollowingFeed(user ? followingIds : []);
  const { data: liveStreams = [] } = useLiveStreams();
  const { data: feedAds = [] } = useActiveAds('feed');
  const isPro = user?.subscription === 'pro';

  const isPeople = activeTab === 'people';
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

  const isGallery = activeTab === 'gallery';

  return (
    <div className={`mx-auto space-y-4 ${isGallery ? 'max-w-4xl' : 'max-w-2xl'}`}>
      {/* Create post + Go Live row — hidden on gallery/people tabs */}
      {!isGallery && !isPeople && (
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <CreatePostForm />
          </div>
          {user && (
            <div className="pt-1">
              <GoLiveButton />
            </div>
          )}
        </div>
      )}

      {/* Live Streams — hidden on gallery/people tabs */}
      {!isGallery && !isPeople && liveStreams.length > 0 && (
        <div className="space-y-2">
          {liveStreams.map((stream) => (
            <LiveStreamCard key={stream.id} stream={stream} />
          ))}
        </div>
      )}

      {user && (
        <div className="rounded-lg border border-border bg-card">
          <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      )}

      {isGallery ? (
        <CommunityGallery />
      ) : isPeople ? (
        <PeopleSearch />
      ) : (
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
            posts.map((post, index) => (
              <div key={post.id}>
                <PostCard post={post} />
                {!isPro && (index + 1) % 5 === 0 && (
                  <div className="mt-4">
                    <AdCard ad={feedAds[(Math.floor(index / 5)) % Math.max(feedAds.length, 1)] || undefined} />
                  </div>
                )}
              </div>
            ))
          )}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-4" />
          {feed.isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    }>
      <FeedContent />
    </Suspense>
  );
}
