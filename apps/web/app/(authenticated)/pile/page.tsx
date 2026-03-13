'use client';

import { useState } from 'react';
import { Plus, Boxes } from 'lucide-react';
import { usePileItems, usePileStats, useUpdatePileStatus, useDeletePileItem } from '../../../hooks/use-pile';
import { PileStats } from '../../../components/pile/pile-stats';
import { PileItemCard } from '../../../components/pile/pile-item-card';

export default function PilePage() {
  const pileItems = usePileItems();
  const pileStats = usePileStats();
  const updateStatus = useUpdatePileStatus();
  const deleteItem = useDeletePileItem();

  const allItems = pileItems.data?.pages.flatMap((page) => page.items) ?? [];

  const handleStatusChange = (projectId: string, status: string) => {
    updateStatus.mutate({ projectId, status });
  };

  const handleDelete = (projectId: string) => {
    if (confirm('Remove this item from your Pile of Shame?')) {
      deleteItem.mutate(projectId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Boxes className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Pile of Shame</h1>
        </div>
      </div>

      <PileStats stats={pileStats.data} isLoading={pileStats.isLoading} />

      {/* Item grid */}
      {pileItems.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg border border-border bg-card" />
          ))}
        </div>
      ) : allItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-16 text-center">
          <Boxes className="h-12 w-12 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Your pile is empty. Add unpainted kits, minis, or projects to track your shame!
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allItems.map((item) => (
              <PileItemCard
                key={item.id}
                item={item}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {pileItems.hasNextPage && (
            <div className="flex justify-center">
              <button
                onClick={() => pileItems.fetchNextPage()}
                disabled={pileItems.isFetchingNextPage}
                className="rounded-md border border-border px-6 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50"
              >
                {pileItems.isFetchingNextPage ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
}
