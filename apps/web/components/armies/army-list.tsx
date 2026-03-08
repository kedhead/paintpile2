'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Loader2, Shield } from 'lucide-react';
import type { UseInfiniteQueryResult } from '@tanstack/react-query';
import { ArmyCard } from './army-card';

interface ArmyListProps {
  query: UseInfiniteQueryResult<unknown, unknown>;
  emptyMessage?: string;
  onCreateClick?: () => void;
}

export function ArmyList({ query, emptyMessage = 'No armies yet', onCreateClick }: ArmyListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const armies = (query.data as any)?.pages?.flatMap((p: any) => p.items) || [];

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && query.hasNextPage && !query.isFetchingNextPage) {
        query.fetchNextPage();
      }
    },
    [query]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (armies.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Shield className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">{emptyMessage}</p>
        {onCreateClick && (
          <button
            onClick={onCreateClick}
            className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
          >
            Create Your First Army
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {armies.map((army: { id: string }) => (
          <ArmyCard key={army.id} army={army as never} />
        ))}
      </div>
      <div ref={sentinelRef} className="h-4" />
      {query.isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
