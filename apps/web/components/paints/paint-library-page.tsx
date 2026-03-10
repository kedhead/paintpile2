'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Palette } from 'lucide-react';
import { usePaintDatabase, usePaintBrands, useMyInventory, useAddToInventory, useRemoveFromInventory } from '../../hooks/use-paints';
import { PaintCard } from './paint-card';
import { AddCustomPaintDialog } from './add-custom-paint-dialog';
import type { RecordModel } from 'pocketbase';

export function PaintLibraryPage() {
  const [tab, setTab] = useState<'all' | 'inventory'>('all');
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('');
  const [showCustomDialog, setShowCustomDialog] = useState(false);

  const paintsQuery = usePaintDatabase(search, brand);
  const brandsQuery = usePaintBrands();
  const inventoryQuery = useMyInventory();
  const addToInventory = useAddToInventory();
  const removeFromInventory = useRemoveFromInventory();

  // Build a lookup: paintId -> inventoryRecordId
  const inventoryMap = useMemo(() => {
    const map = new Map<string, string>();
    if (inventoryQuery.data) {
      for (const inv of inventoryQuery.data) {
        map.set(inv.paint, inv.id);
      }
    }
    return map;
  }, [inventoryQuery.data]);

  // Get inventory paint records (from expand)
  const inventoryPaints = useMemo(() => {
    if (!inventoryQuery.data) return [];
    return inventoryQuery.data
      .filter((inv) => inv.expand?.paint)
      .map((inv) => inv.expand!.paint as RecordModel);
  }, [inventoryQuery.data]);

  // Filter inventory paints by search/brand client-side
  const filteredInventoryPaints = useMemo(() => {
    let result = inventoryPaints;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((p) => p.name?.toLowerCase().includes(q));
    }
    if (brand.trim()) {
      result = result.filter((p) => p.brand === brand.trim());
    }
    return result;
  }, [inventoryPaints, search, brand]);

  const allPaints = useMemo(() => {
    if (!paintsQuery.data) return [];
    return paintsQuery.data.pages.flatMap((page) => page.items);
  }, [paintsQuery.data]);

  const brands = brandsQuery.data || [];

  const handleToggleOwned = (paint: RecordModel) => {
    const inventoryId = inventoryMap.get(paint.id);
    if (inventoryId) {
      removeFromInventory.mutate(inventoryId);
    } else {
      addToInventory.mutate(paint.id);
    }
  };

  const displayPaints = tab === 'inventory' ? filteredInventoryPaints : allPaints;
  const isLoading = tab === 'inventory' ? inventoryQuery.isLoading : paintsQuery.isLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Paint Library</h1>
        <button
          onClick={() => setShowCustomDialog(true)}
          className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
        >
          <Plus className="h-4 w-4" />
          Add Custom Paint
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => setTab('all')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All Paints
        </button>
        <button
          onClick={() => setTab('inventory')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === 'inventory' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          My Inventory
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
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
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">Loading paints...</p>
        </div>
      ) : displayPaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Palette className="h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {tab === 'inventory'
              ? 'No paints in your inventory yet. Browse All Paints to add some!'
              : 'No paints found.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {displayPaints.map((paint: RecordModel) => (
              <PaintCard
                key={paint.id}
                paint={paint}
                owned={inventoryMap.has(paint.id)}
                onToggleOwned={() => handleToggleOwned(paint)}
              />
            ))}
          </div>

          {tab === 'all' && paintsQuery.hasNextPage && (
            <div className="flex justify-center">
              <button
                onClick={() => paintsQuery.fetchNextPage()}
                disabled={paintsQuery.isFetchingNextPage}
                className="rounded-lg bg-muted px-6 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {paintsQuery.isFetchingNextPage ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Custom Paint Dialog */}
      <AddCustomPaintDialog open={showCustomDialog} onClose={() => setShowCustomDialog(false)} />
    </div>
  );
}
