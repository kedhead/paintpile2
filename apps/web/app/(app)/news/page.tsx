'use client';

import { useCallback, useRef, useEffect } from 'react';
import { Newspaper, Loader2 } from 'lucide-react';
import { useNews } from '../../../hooks/use-news';
import { NewsCard } from '../../../components/news/news-card';

export default function NewsPage() {
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useNews();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const items = data?.pages.flatMap((p) => p.items) || [];

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
        <Newspaper className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">News & Updates</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <Newspaper className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No news yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
          <div ref={sentinelRef} className="h-4" />
        </div>
      )}
    </div>
  );
}
