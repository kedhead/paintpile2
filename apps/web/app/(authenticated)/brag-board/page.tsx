'use client';

import { useCallback, useRef, useEffect } from 'react';
import { Award, Loader2 } from 'lucide-react';
import { useActivityFeed } from '../../../hooks/use-activities';
import { BragCard } from '../../../components/brag-board/brag-card';

export default function BragBoardPage() {
  // Filter for critique shared activities only
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useActivityFeed('all');
  const sentinelRef = useRef<HTMLDivElement>(null);

  const activities = (data?.pages.flatMap((p) => p.items) || []).filter(
    (a) => a.type === 'project_critique_shared'
  );

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
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
      <div className="flex items-center gap-2">
        <Award className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Brag Board</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        See how the community&apos;s miniatures are scoring!
      </p>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <Award className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No shared critiques yet. Get a critique on your project and share it!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <BragCard key={activity.id} activity={activity} />
          ))}
          <div ref={sentinelRef} className="h-4" />
        </div>
      )}
    </div>
  );
}
