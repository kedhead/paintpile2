'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Check, Loader2, Plus } from 'lucide-react';
import { useAuth } from '../auth-provider';
import { useAddToInventory, useMyInventory } from '../../hooks/use-paints';
import { deltaE76, hexToLab } from '../../lib/color-math';

export interface UsedPaint {
  id: string;
  name: string;
  brand: string;
  hex_color: string;
}

/** Closer than this and we call an owned paint a usable stand-in. */
const CLOSE_MATCH_DELTA_E = 15;

/**
 * "Paints used" with the viewer's own collection overlaid: which ones they
 * already own, and for the rest, the closest paint they have or a one-tap add.
 */
export function PaintsUsed({ paints }: { paints: UsedPaint[] }) {
  const { user, loading } = useAuth();
  const { data: inventory, isLoading } = useMyInventory();
  const addToInventory = useAddToInventory();

  const owned = useMemo(() => {
    const ids = new Set<string>();
    for (const record of inventory ?? []) ids.add(record.paint as string);
    return ids;
  }, [inventory]);

  const closest = useMemo(() => {
    const mine = (inventory ?? [])
      .map((r) => r.expand?.paint as UsedPaint | undefined)
      .filter((p): p is UsedPaint => !!p?.hex_color)
      .map((p) => ({ paint: p, lab: hexToLab(p.hex_color) }));
    const result = new Map<string, UsedPaint>();
    if (!mine.length) return result;
    for (const paint of paints) {
      if (owned.has(paint.id) || !paint.hex_color) continue;
      const target = hexToLab(paint.hex_color);
      let best: UsedPaint | null = null;
      let bestD = CLOSE_MATCH_DELTA_E;
      for (const m of mine) {
        const d = deltaE76(target, m.lab);
        if (d < bestD) { bestD = d; best = m.paint; }
      }
      if (best) result.set(paint.id, best);
    }
    return result;
  }, [inventory, owned, paints]);

  const ownedCount = paints.filter((p) => owned.has(p.id)).length;
  const showOwnership = !!user && !isLoading;

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">Paints used ({paints.length})</h2>
        {showOwnership && (
          <span className={`text-xs font-medium ${ownedCount === paints.length ? 'text-green-400' : 'text-muted-foreground'}`}>
            You own {ownedCount} of {paints.length}
          </span>
        )}
      </div>

      {showOwnership && (
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${paints.length ? (ownedCount / paints.length) * 100 : 0}%` }}
          />
        </div>
      )}

      <ul className="space-y-2">
        {paints.map((paint) => {
          const isOwned = owned.has(paint.id);
          const stand_in = closest.get(paint.id);
          const adding = addToInventory.isPending && addToInventory.variables === paint.id;
          return (
            <li key={paint.id} className="text-sm">
              <div className="flex items-center gap-2.5">
                <span
                  className="h-5 w-5 shrink-0 rounded-full border border-border"
                  style={{ background: paint.hex_color }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-foreground">
                  {paint.name} <span className="text-xs text-muted-foreground">· {paint.brand}</span>
                </span>
                {showOwnership &&
                  (isOwned ? (
                    <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-green-400">
                      <Check className="h-3.5 w-3.5" /> Owned
                    </span>
                  ) : (
                    <button
                      onClick={() => addToInventory.mutate(paint.id)}
                      disabled={adding}
                      className="flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-60"
                      title="Add to my paints"
                    >
                      {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                      I have it
                    </button>
                  ))}
              </div>
              {showOwnership && !isOwned && stand_in && (
                <p className="ml-[30px] mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  Closest you own:
                  <span className="h-3 w-3 rounded-full border border-border" style={{ background: stand_in.hex_color }} aria-hidden />
                  {stand_in.name} ({stand_in.brand})
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {!user && !loading && (
        <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          <Link href="/auth/signup" className="font-medium text-primary hover:underline">Join free</Link> to see which of
          these you already own — and the closest match in your collection for the rest.
        </p>
      )}
    </section>
  );
}
