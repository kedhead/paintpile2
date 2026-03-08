'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import type { UseInfiniteQueryResult } from '@tanstack/react-query';
import { ProjectCard } from './project-card';

interface ProjectListProps {
  query: UseInfiniteQueryResult<unknown, unknown>;
  emptyMessage?: string;
}

export function ProjectList({ query, emptyMessage = 'No projects yet' }: ProjectListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects = (query.data as any)?.pages?.flatMap((p: any) => p.items) || [];

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
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {projects.map((project: { id: string }) => (
          <ProjectCard key={project.id} project={project as never} />
        ))}
      </div>
      <div ref={sentinelRef} className="h-4" />
      {query.isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );
}
