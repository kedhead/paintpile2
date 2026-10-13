import type { Metadata } from 'next';
import Link from 'next/link';
import { CollectionCard } from '../../../components/collections/collection-card';
import { buildCollectionCards } from '../../../lib/collections-server';
import { publicPb, safe } from '../../../lib/pb-server';

export const metadata: Metadata = {
  title: 'Collections — Paintpile',
  description: 'Curated collections of painted miniatures from the Paintpile community.',
};

const PER_PAGE = 24;

export default async function CollectionsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const pb = publicPb();
  const result = await safe(
    () => pb.collection('project_collections').getList(page, PER_PAGE, { filter: 'is_public = true', sort: '-updated', expand: 'user' }),
    null,
  );
  // Hide empty boards from the public index; they're still visible on their owner's profile.
  const cards = (await buildCollectionCards(pb, result?.items ?? [])).filter((c) => c.count > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bebas text-4xl tracking-wide text-foreground">Collections</h1>
        <p className="text-sm text-muted-foreground">
          Curated boards of projects from the community. Hit <span className="font-medium text-foreground">Save</span> on any project to start your own.
        </p>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No collections yet. Save a project you love to start the first one.
        </div>
      ) : (
        <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((card) => <CollectionCard key={card.id} card={card} />)}
        </div>
      )}

      {result && result.totalPages > 1 && (
        <div className="flex justify-center gap-3 text-sm">
          {page > 1 && <Link href={`/collections?page=${page - 1}`} className="rounded-lg border border-border px-4 py-2 hover:bg-muted">Newer</Link>}
          {page < result.totalPages && <Link href={`/collections?page=${page + 1}`} className="rounded-lg border border-border px-4 py-2 hover:bg-muted">Older</Link>}
        </div>
      )}
    </div>
  );
}
