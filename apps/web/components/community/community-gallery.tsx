'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Loader2, Globe } from 'lucide-react';
import { usePublicProjects } from '../../hooks/use-projects';
import { ProjectCard } from '../projects/project-card';

export function CommunityGallery() {
  const [search, setSearch] = useState('');
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = usePublicProjects();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const projects = data?.pages.flatMap((p) => p.items) || [];
  const filtered = search
    ? projects.filter((p) =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : projects;

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
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search projects, tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <Globe className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {search ? 'No projects match your search' : 'No public projects yet'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
      <div ref={sentinelRef} className="h-4" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
