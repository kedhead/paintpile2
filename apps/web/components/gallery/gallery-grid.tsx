'use client';

import { useState } from 'react';
import type { RecordModel } from 'pocketbase';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../auth-provider';
import { GalleryCard } from './gallery-card';
import { GALLERY_PAGE_SIZE, galleryQuery, type GallerySort } from '../../lib/gallery';

interface GalleryGridProps {
  initialItems: RecordModel[];
  totalPages: number;
  sort: GallerySort;
  /** Extra PocketBase filter, e.g. one painter's projects on their profile */
  filter?: string;
  showAuthor?: boolean;
}

export function GalleryGrid({ initialItems, totalPages, sort, filter, showAuthor = true }: GalleryGridProps) {
  const { pb } = useAuth();
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    setLoading(true);
    try {
      const next = await pb
        .collection('projects')
        .getList(page + 1, GALLERY_PAGE_SIZE, galleryQuery(sort, filter));
      const seen = new Set(items.map((i) => i.id));
      setItems([...items, ...next.items.filter((i) => !seen.has(i.id))]);
      setPage(page + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((project) => (
          <GalleryCard key={project.id} project={project} showAuthor={showAuthor} />
        ))}
      </div>
      {page < totalPages && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
