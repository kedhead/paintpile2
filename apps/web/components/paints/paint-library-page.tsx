'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Palette, Package, ChevronDown, ChevronRight, Loader2, Check } from 'lucide-react';
import { usePaintDatabase, usePaintBrands, usePaintSets, useMyInventory, useAddToInventory, useRemoveFromInventory, useAddSetToInventory } from '../../hooks/use-paints';
import { PaintCard } from './paint-card';
import { AddCustomPaintDialog } from './add-custom-paint-dialog';
import type { RecordModel } from 'pocketbase';

export function PaintLibraryPage() {
  const [tab, setTab] = useState<'all' | 'inventory' | 'sets'>('all');
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('');
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [expandedSet, setExpandedSet] = useState<string | null>(null);
  const [addingSet, setAddingSet] = useState<string | null>(null);
  const [setResult, setSetResult] = useState<{ setId: string; added: number; skipped: number; notFound: number } | null>(null);

  const paintsQuery = usePaintDatabase(search, brand);
  const brandsQuery = usePaintBrands();
  const paintSetsQuery = usePaintSets();
  const inventoryQuery = useMyInventory();
  const addToInventory = useAddToInventory();
  const removeFromInventory = useRemoveFromInventory();
  const addSetToInventory = useAddSetToInventory();

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

  // Combine brands from both paints and paint sets for the dropdown
  const paintBrands = brandsQuery.data || [];
  const setBrands = useMemo(() => {
    if (!paintSetsQuery.data) return [];
    const s = new Set<string>();
    for (const ps of paintSetsQuery.data) {
      if (ps.brand) s.add(ps.brand);
    }
    return Array.from(s).sort();
  }, [paintSetsQuery.data]);

  const brands = useMemo(() => {
    if (tab === 'sets') return setBrands;
    return paintBrands;
  }, [tab, paintBrands, setBrands]);

  // Filter paint sets by search/brand
  const filteredSets = useMemo(() => {
    if (!paintSetsQuery.data) return [];
    let result = paintSetsQuery.data;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((s) =>
        s.set_name?.toLowerCase().includes(q) || s.brand?.toLowerCase().includes(q)
      );
    }
    if (brand.trim()) {
      result = result.filter((s) => s.brand === brand.trim());
    }
    return result;
  }, [paintSetsQuery.data, search, brand]);

  // Group sets by brand
  const setsByBrand = useMemo(() => {
    const map = new Map<string, RecordModel[]>();
    for (const set of filteredSets) {
      const b = set.brand || 'Unknown';
      if (!map.has(b)) map.set(b, []);
      map.get(b)!.push(set);
    }
    return map;
  }, [filteredSets]);

  const handleToggleOwned = (paint: RecordModel) => {
    const inventoryId = inventoryMap.get(paint.id);
    if (inventoryId) {
      removeFromInventory.mutate(inventoryId);
    } else {
      addToInventory.mutate(paint.id);
    }
  };

  const handleAddSet = async (set: RecordModel) => {
    setAddingSet(set.id);
    setSetResult(null);
    try {
      const paintNames: string[] = typeof set.paint_names === 'string'
        ? JSON.parse(set.paint_names)
        : set.paint_names || [];
      const result = await addSetToInventory.mutateAsync({ paintNames, brand: set.brand });
      setSetResult({ setId: set.id, ...result });
    } catch {
      // handled by mutation
    }
    setAddingSet(null);
  };

  const displayPaints = tab === 'inventory' ? filteredInventoryPaints : allPaints;
  const isLoading = tab === 'inventory' ? inventoryQuery.isLoading : tab === 'sets' ? paintSetsQuery.isLoading : paintsQuery.isLoading;

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
        {(['all', 'inventory', 'sets'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'all' ? 'All Paints' : t === 'inventory' ? 'My Inventory' : 'Paint Sets'}
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === 'sets' ? 'Search paint sets...' : 'Search paints...'}
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

      {/* Paint Sets Tab */}
      {tab === 'sets' ? (
        isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Loading paint sets...</p>
          </div>
        ) : filteredSets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No paint sets found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(setsByBrand.entries()).map(([brandName, sets]) => (
              <div key={brandName}>
                <h2 className="text-lg font-semibold text-foreground mb-3">{brandName}</h2>
                <div className="space-y-2">
                  {sets.map((set) => {
                    const paintNames: string[] = typeof set.paint_names === 'string'
                      ? (() => { try { return JSON.parse(set.paint_names); } catch { return []; } })()
                      : set.paint_names || [];
                    const isExpanded = expandedSet === set.id;
                    const result = setResult?.setId === set.id ? setResult : null;

                    return (
                      <div key={set.id} className="rounded-lg border border-border bg-card overflow-hidden">
                        <button
                          onClick={() => setExpandedSet(isExpanded ? null : set.id)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Package className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-foreground truncate">{set.set_name}</h3>
                              <p className="text-xs text-muted-foreground">
                                {set.paint_count || paintNames.length} paints
                              </p>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="border-t border-border p-4 space-y-3">
                            {set.description && (
                              <p className="text-xs text-muted-foreground">{set.description}</p>
                            )}

                            {paintNames.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {paintNames.map((name: string, i: number) => (
                                  <span key={i} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                                    {name}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-3 pt-1">
                              <button
                                onClick={() => handleAddSet(set)}
                                disabled={addingSet === set.id}
                                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
                              >
                                {addingSet === set.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Plus className="h-4 w-4" />
                                )}
                                Add Set to Inventory
                              </button>

                              {result && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Check className="h-3 w-3 text-green-400" />
                                  {result.added} added, {result.skipped} already owned
                                  {result.notFound > 0 && `, ${result.notFound} not in database`}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Paint Grid (All Paints / Inventory tabs) */
        <>
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
        </>
      )}

      {/* Custom Paint Dialog */}
      <AddCustomPaintDialog open={showCustomDialog} onClose={() => setShowCustomDialog(false)} />
    </div>
  );
}
