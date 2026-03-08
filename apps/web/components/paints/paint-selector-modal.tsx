'use client';

import { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { usePaintDatabase } from '../../hooks/use-paints';
import type { RecordModel } from 'pocketbase';

interface PaintSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (paintIds: string[]) => void;
  excludeIds?: string[];
}

export function PaintSelectorModal({ open, onClose, onSelect, excludeIds = [] }: PaintSelectorModalProps) {
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const paintsQuery = usePaintDatabase(search, brand);

  const allPaints = useMemo(() => {
    if (!paintsQuery.data) return [];
    return paintsQuery.data.pages.flatMap((page) => page.items);
  }, [paintsQuery.data]);

  const filteredPaints = useMemo(() => {
    return allPaints.filter((p) => !excludeIds.includes(p.id));
  }, [allPaints, excludeIds]);

  const brands = useMemo(() => {
    const set = new Set<string>();
    allPaints.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set).sort();
  }, [allPaints]);

  const togglePaint = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    onSelect(Array.from(selected));
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="flex w-full max-w-2xl flex-col rounded-lg bg-card shadow-xl"
        style={{ maxHeight: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold text-foreground">Select Paints</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 border-b border-border p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search paints..."
              className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Paint Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {paintsQuery.isLoading ? (
            <p className="text-center text-sm text-muted-foreground">Loading paints...</p>
          ) : filteredPaints.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">No paints found.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {filteredPaints.map((paint: RecordModel) => (
                <button
                  key={paint.id}
                  onClick={() => togglePaint(paint.id)}
                  className={`overflow-hidden rounded-lg border text-left transition-colors ${
                    selected.has(paint.id)
                      ? 'border-primary ring-1 ring-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div
                    className="h-10 w-full"
                    style={{ backgroundColor: paint.color || '#888888' }}
                  />
                  <div className="p-2">
                    <p className="text-xs text-muted-foreground truncate">{paint.brand}</p>
                    <p className="text-xs font-medium text-foreground truncate">{paint.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {paintsQuery.hasNextPage && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => paintsQuery.fetchNextPage()}
                disabled={paintsQuery.isFetchingNextPage}
                className="rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {paintsQuery.isFetchingNextPage ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border p-4">
          <span className="text-sm text-muted-foreground">
            {selected.size} paint{selected.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selected.size === 0}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/80 disabled:opacity-50"
            >
              Add Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
