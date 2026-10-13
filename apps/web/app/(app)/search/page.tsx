import type { Metadata } from 'next';
import Link from 'next/link';
import type { RecordModel } from 'pocketbase';
import { Search } from 'lucide-react';
import { GalleryCard } from '../../../components/gallery/gallery-card';
import { CollectionCard } from '../../../components/collections/collection-card';
import { UserAvatar } from '../../../components/social/user-avatar';
import { buildCollectionCards } from '../../../lib/collections-server';
import { publicPb, safe } from '../../../lib/pb-server';
import { profilePath } from '../../../lib/urls';

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = ((await searchParams).q || '').trim();
  // Result pages are thin and endless; keep them out of search engines.
  return { title: q ? `"${q}" — Search — Paintpile` : 'Search — Paintpile', robots: { index: false } };
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  if (!count) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">
        {title} <span className="text-sm font-normal text-muted-foreground">{count}</span>
      </h2>
      {children}
    </section>
  );
}

export default async function SearchPage({ searchParams }: Props) {
  const q = ((await searchParams).q || '').trim().slice(0, 60);
  const pb = publicPb();
  const like = (fields: string[]) => `(${fields.map((f) => `${f} ~ {:q}`).join(' || ')})`;

  const [projects, painters, boards, paints] = q
    ? await Promise.all([
        safe(() => pb.collection('projects').getList(1, 20, {
          filter: pb.filter(`is_public = true && cover_photo != "" && ${like(['name', 'description', 'tags', 'style', 'kind', 'techniques', 'color_scheme'])}`, { q }),
          sort: '-like_count,-created',
          expand: 'user',
        }), null),
        safe(() => pb.collection('users').getList(1, 12, {
          filter: pb.filter(like(['username', 'name']), { q }),
          fields: 'id,collectionId,username,name,avatar,bio',
        }), null),
        safe(() => pb.collection('project_collections').getList(1, 6, {
          filter: pb.filter(`is_public = true && ${like(['name', 'description'])}`, { q }),
          sort: '-updated',
          expand: 'user',
        }), null),
        safe(() => pb.collection('paints').getList(1, 16, {
          filter: pb.filter(like(['name', 'brand']), { q }),
          sort: 'brand,name',
        }), null),
      ])
    : [null, null, null, null];

  const collectionCards = (await buildCollectionCards(pb, boards?.items ?? [])).filter((c) => c.count > 0);
  const total = (projects?.totalItems ?? 0) + (painters?.totalItems ?? 0) + collectionCards.length + (paints?.totalItems ?? 0);

  return (
    <div className="space-y-8">
      <form action="/search" className="relative mx-auto max-w-2xl">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          name="q"
          defaultValue={q}
          autoFocus={!q}
          placeholder="Search projects, painters, collections and paints"
          className="w-full rounded-xl border border-border bg-card py-3 pl-12 pr-4 text-base text-foreground shadow-sm focus:border-primary focus:outline-none"
        />
      </form>

      {!q ? (
        <p className="text-center text-sm text-muted-foreground">
          Try a faction, a technique, a color, or a paint, like <Link href="/search?q=orks" className="text-primary hover:underline">orks</Link>,{' '}
          <Link href="/search?q=glazing" className="text-primary hover:underline">glazing</Link> or{' '}
          <Link href="/search?q=Leadbelcher" className="text-primary hover:underline">Leadbelcher</Link>.
        </p>
      ) : total === 0 ? (
        <p className="text-center text-sm text-muted-foreground">Nothing found for &ldquo;{q}&rdquo;. Try a broader word.</p>
      ) : (
        <>
          <Section title="Projects" count={projects?.totalItems ?? 0}>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {projects!.items.map((p) => <GalleryCard key={p.id} project={p} />)}
            </div>
          </Section>

          <Section title="Painters" count={painters?.totalItems ?? 0}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {painters?.items.map((u: RecordModel) => (
                <Link key={u.id} href={profilePath(u)} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/50">
                  <UserAvatar user={u} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{u.name || u.username}</p>
                    {u.username && <p className="truncate text-xs text-muted-foreground">@{u.username}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </Section>

          <Section title="Collections" count={collectionCards.length}>
            <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {collectionCards.map((card) => <CollectionCard key={card.id} card={card} />)}
            </div>
          </Section>

          <Section title="Paints" count={paints?.totalItems ?? 0}>
            <div className="flex flex-wrap gap-2">
              {paints?.items.map((paint) => (
                <Link
                  key={paint.id}
                  href={`/paints?q=${encodeURIComponent(paint.name)}`}
                  className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 text-sm text-foreground hover:border-primary/50"
                >
                  <span className="h-6 w-6 rounded-full border border-border" style={{ background: paint.hex_color }} aria-hidden />
                  {paint.name}
                  <span className="text-xs text-muted-foreground">{paint.brand}</span>
                </Link>
              ))}
              {(paints?.totalItems ?? 0) > (paints?.items.length ?? 0) && (
                <Link href={`/paints?q=${encodeURIComponent(q)}`} className="self-center text-sm text-primary hover:underline">
                  All {paints!.totalItems} paints →
                </Link>
              )}
            </div>
          </Section>
        </>
      )}
    </div>
  );
}
