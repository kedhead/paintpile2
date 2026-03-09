'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Loader2, Activity } from 'lucide-react';
import { useActivityFeed } from '../../hooks/use-activities';
import { ActivityItem } from './activity-item';

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'projects', label: 'Projects' },
  { key: 'armies', label: 'Armies' },
  { key: 'recipes', label: 'Recipes' },
  { key: 'likes', label: 'Likes' },
  { key: 'follows', label: 'Follows' },
];

export function ActivityFeed() {
  const [filter, setFilter] = useState('all');
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useActivityFeed(filter);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const activities = data?.pages.flatMap((p) => p.items) || [];

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
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <Activity className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
          <div ref={sentinelRef} className="h-4" />
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
