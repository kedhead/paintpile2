'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  Loader2,
  Package,
  Check,
  AlertCircle,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../../../components/auth-provider';
import { CURATED_PAINT_SETS, getCuratedBrands } from '../../../../lib/curated-paint-sets';

interface DBSet {
  id: string;
  set_name: string;
  brand: string;
  paint_count: number;
  paint_names: string;
  is_curated: boolean;
}

export default function SeedPaintSetsPage() {
  const { pb } = useAuth();
  const [dbSets, setDbSets] = useState<DBSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ created: number; updated: number } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const brands = getCuratedBrands();
  const totalCurated = CURATED_PAINT_SETS.length;
  const totalPaints = CURATED_PAINT_SETS.reduce((sum, s) => sum + s.paintNames.length, 0);

  const loadDbSets = async () => {
    setLoading(true);
    try {
      const sets = await pb.collection('paint_sets').getFullList<DBSet>({
        sort: 'brand,set_name',
      });
      setDbSets(sets);
    } catch {
      // collection may not exist yet
      setDbSets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDbSets();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSeedAll = async () => {
    setSeeding(true);
    setError(null);
    setSeedResult(null);

    let created = 0;
    let updated = 0;

    try {
      for (const set of CURATED_PAINT_SETS) {
        try {
          // Check if exists
          const existing = await pb.collection('paint_sets').getFullList({
            filter: `set_name="${set.setName.replace(/"/g, '\\"')}" && brand="${set.brand}"`,
            requestKey: null,
          });

          const payload = {
            set_name: set.setName,
            brand: set.brand,
            paint_names: JSON.stringify(set.paintNames),
            paint_count: set.paintCount,
            description: set.description,
            source_url: set.sourceUrl,
            is_curated: true,
          };

          if (existing.length > 0) {
            await pb.collection('paint_sets').update(existing[0].id, payload);
            updated++;
          } else {
            await pb.collection('paint_sets').create(payload);
            created++;
          }
        } catch (err) {
          console.error(`Failed to seed "${set.setName}":`, err);
        }
      }

      setSeedResult({ created, updated });
      await loadDbSets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Seeding failed');
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this paint set?')) return;
    setDeleting(id);
    try {
      await pb.collection('paint_sets').delete(id);
      setDbSets(dbSets.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm(`Delete all ${dbSets.length} paint sets? This cannot be undone.`)) return;
    setSeeding(true);
    try {
      for (const set of dbSets) {
        await pb.collection('paint_sets').delete(set.id);
      }
      setDbSets([]);
    } catch (err) {
      console.error('Bulk delete failed:', err);
    } finally {
      setSeeding(false);
    }
  };

  // Group DB sets by brand
  const dbByBrand: Record<string, DBSet[]> = {};
  dbSets.forEach((s) => {
    if (!dbByBrand[s.brand]) dbByBrand[s.brand] = [];
    dbByBrand[s.brand].push(s);
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-foreground">Paint Sets</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{totalCurated}</p>
          <p className="text-xs text-muted-foreground">Curated Sets</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{totalPaints}</p>
          <p className="text-xs text-muted-foreground">Total Paints</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{dbSets.length}</p>
          <p className="text-xs text-muted-foreground">In Database</p>
        </div>
      </div>

      {/* Curated sets preview */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          Curated Paint Sets ({totalCurated} sets from {brands.length} brands)
        </h2>
        <p className="text-xs text-muted-foreground">
          Verified paint set data ported from the original Paintpile. Each set contains exact paint names
          matched against the paint database.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {brands.map((brand) => {
            const count = CURATED_PAINT_SETS.filter((s) => s.brand === brand).length;
            return (
              <span
                key={brand}
                className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-foreground"
              >
                {brand} ({count})
              </span>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSeedAll}
            disabled={seeding}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
          >
            {seeding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Seed All {totalCurated} Sets
          </button>
          {dbSets.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={seeding}
              className="flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
          )}
        </div>

        {seedResult && (
          <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
            <Check className="h-4 w-4" />
            Seeded successfully: {seedResult.created} created, {seedResult.updated} updated
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>

      {/* Database contents */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Database ({dbSets.length} sets)
          </h2>
          <button
            onClick={loadDbSets}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : dbSets.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <Package className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              No paint sets in database. Click &quot;Seed All&quot; to import curated sets.
            </p>
          </div>
        ) : (
          Object.entries(dbByBrand)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([brand, sets]) => (
              <div key={brand} className="space-y-1.5">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {brand} ({sets.length})
                </h3>
                {sets.map((set) => {
                  let paintNames: string[] = [];
                  try {
                    paintNames = JSON.parse(set.paint_names);
                  } catch {
                    // ignore
                  }
                  return (
                    <div
                      key={set.id}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-foreground truncate">
                            {set.set_name}
                          </h4>
                          {set.is_curated && (
                            <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                              Curated
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {set.paint_count} paints
                          {paintNames.length > 0 && (
                            <span className="ml-1">
                              — {paintNames.slice(0, 5).join(', ')}
                              {paintNames.length > 5 && ` +${paintNames.length - 5} more`}
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(set.id)}
                        disabled={deleting === set.id}
                        className="flex-shrink-0 rounded p-1.5 text-muted-foreground hover:bg-red-900/30 hover:text-red-400"
                      >
                        {deleting === set.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))
        )}
      </div>
    </div>
  );
}
