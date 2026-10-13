'use client';

import { useRouter } from 'next/navigation';
import type { RecordModel } from 'pocketbase';
import { X } from 'lucide-react';
import { GalleryCard } from '../gallery/gallery-card';
import { useRemoveFromCollection } from '../../hooks/use-collections';

/** Projects in a collection; owners get a remove button on each. */
export function CollectionItemsGrid({ items, isOwner }: { items: { itemId: string; project: RecordModel }[]; isOwner: boolean }) {
  const router = useRouter();
  const remove = useRemoveFromCollection();

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map(({ itemId, project }) => (
        <div key={itemId} className="relative">
          <GalleryCard project={project} />
          {isOwner && (
            <button
              onClick={async () => { await remove.mutateAsync(itemId); router.refresh(); }}
              disabled={remove.isPending && remove.variables === itemId}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
              aria-label={`Remove ${project.name} from this collection`}
              title="Remove from collection"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
