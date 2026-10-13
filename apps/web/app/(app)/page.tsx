import type { Metadata } from 'next';
import Link from 'next/link';
import type { ListResult, RecordModel } from 'pocketbase';
import { GalleryGrid } from '../../components/gallery/gallery-grid';
import { getViewerId, publicPb, safe } from '../../lib/pb-server';
import { GALLERY_PAGE_SIZE, GALLERY_SORTS, galleryQuery, parseGallerySort } from '../../lib/gallery';
import { describeFilters, filterHref, galleryFilterExpr, parseGalleryFilters } from '../../lib/gallery-filters';
import { X } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Paintpile — Painted miniatures and the paints behind them',
  description:
    'Browse painted miniatures from the community and see exactly which paints made them. Track your own projects, paint collection and pile of shame. Free.',
};

const EMPTY: ListResult<RecordModel> = { page: 1, perPage: GALLERY_PAGE_SIZE, totalItems: 0, totalPages: 0, items: [] };

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sort = parseGallerySort(params.sort);
  const filters = parseGalleryFilters(params);
  const filterLabel = describeFilters(filters);
  const pb = publicPb();
  const filterExpr = galleryFilterExpr(pb, filters);
  // A filtered view is already narrow; don't also limit it to this month.
  const effectiveSort = filterExpr && sort === 'trending' ? 'popular' : sort;
  const [result, viewerId] = await Promise.all([
    safe(() => pb.collection('projects').getList(1, GALLERY_PAGE_SIZE, galleryQuery(effectiveSort, filterExpr)), EMPTY),
    getViewerId(),
  ]);
  const sortHref = (id: string) => {
    const qs = new URLSearchParams(filterHref(filters).slice(2));
    if (id !== 'trending') qs.set('sort', id);
    const str = qs.toString();
    return str ? `/?${str}` : '/';
  };

  return (
    <div className="space-y-6">
      {!viewerId && !filterLabel && (
        <section className="rounded-2xl border border-border bg-card px-6 py-8 text-center sm:py-10">
          <h1 className="font-bebas text-4xl tracking-wide text-foreground sm:text-5xl">
            Every mini, with the recipe behind it
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Browse painted miniatures and see exactly which paints made them. Then track your own
            projects, paints and pile — free.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/auth/signup" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/85">
              Join free
            </Link>
            <Link href="/paints" className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
              Browse 4,700+ paints
            </Link>
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {filterLabel && (
          <Link
            href={sort === 'trending' ? '/' : `/?sort=${sort}`}
            className="flex items-center gap-1.5 rounded-full border border-primary bg-primary/15 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-primary/25"
            title="Clear filter"
          >
            {filterLabel}
            <X className="h-3.5 w-3.5" />
          </Link>
        )}
        <div className="inline-flex rounded-xl border border-border bg-card p-1">
          {GALLERY_SORTS.map(({ id, label }) => (
            <Link
              key={id}
              href={sortHref(id)}
              className={`rounded-lg px-4 py-1.5 text-sm transition-colors ${
                id === sort ? 'bg-muted font-semibold text-foreground' : 'font-medium text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {result.items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          {filterLabel ? (
            <>No projects match {filterLabel} yet. <Link href="/" className="text-primary hover:underline">Clear the filter</Link>.</>
          ) : sort === 'trending' ? (
            <>Nothing trending this month yet. <Link href="/?sort=latest" className="text-primary hover:underline">See the latest projects</Link>.</>
          ) : (
            'No public projects yet — be the first to share one!'
          )}
        </div>
      ) : (
        <GalleryGrid
          key={`${sort}|${filterExpr ?? ''}`}
          initialItems={result.items}
          totalPages={result.totalPages}
          sort={effectiveSort}
          filter={filterExpr}
        />
      )}
    </div>
  );
}
