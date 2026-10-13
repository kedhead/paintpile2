import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import type { RecordModel } from 'pocketbase';
import { Lock } from 'lucide-react';
import { UserAvatar } from '../../../../components/social/user-avatar';
import { CollectionItemsGrid } from '../../../../components/collections/collection-items-grid';
import { CollectionOwnerTools } from '../../../../components/collections/collection-owner-tools';
import { fileUrl, getViewerId, safe, SITE_URL, viewerPb } from '../../../../lib/pb-server';
import { collectionPath } from '../../../../lib/collections';
import { parseProjectId, profilePath } from '../../../../lib/urls';

type Params = { params: Promise<{ collectionId: string }> };

async function load(param: string) {
  const id = parseProjectId(param); // same "<id>-<slug>" shape as projects
  if (!/^[a-z0-9]{15}$/i.test(id)) return null;
  const pb = await viewerPb();
  const board = await safe(() => pb.collection('project_collections').getOne(id, { expand: 'user' }), null);
  if (!board) return null;
  const items = await safe(
    () => pb.collection('project_collection_items').getFullList({
      filter: pb.filter('collection = {:id}', { id: board.id }),
      expand: 'project.user',
      sort: '-created',
    }),
    [] as RecordModel[],
  );
  return { board, items: items.filter((i) => i.expand?.project).map((i) => ({ itemId: i.id, project: i.expand!.project as RecordModel })) };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const data = await load((await params).collectionId);
  if (!data?.board.is_public) return { title: 'Collection — Paintpile' };
  const curator = data.board.expand?.user as RecordModel | undefined;
  const title = `${data.board.name}${curator ? ` — curated by ${curator.username || curator.name}` : ''} — Paintpile`;
  const description = data.board.description || `${data.items.length} painted miniatures collected on Paintpile.`;
  const cover = data.items.find((i) => i.project.cover_photo)?.project;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${collectionPath(data.board)}` },
    openGraph: { title, description, siteName: 'Paintpile', images: cover ? [fileUrl(cover, cover.cover_photo, '1200x0')] : undefined },
  };
}

export default async function CollectionPage({ params }: Params) {
  const { collectionId } = await params;
  const [data, viewerId] = await Promise.all([load(collectionId), getViewerId()]);
  if (!data) notFound();
  const { board, items } = data;

  const canonical = collectionPath(board);
  if (decodeURIComponent(`/collections/${collectionId}`) !== canonical) permanentRedirect(canonical);

  const curator = board.expand?.user as RecordModel | undefined;
  const isOwner = !!viewerId && viewerId === board.user;
  const profileHref = curator ? profilePath(curator) : '/';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="flex items-center gap-2 font-bebas text-4xl tracking-wide text-foreground">
            {board.name}
            {!board.is_public && <Lock className="h-5 w-5 text-muted-foreground" aria-label="Private" />}
          </h1>
          {board.description && <p className="max-w-2xl text-sm text-foreground">{board.description}</p>}
          {curator && (
            <Link href={profileHref} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <UserAvatar user={curator} size="xs" />
              Curated by <span className="font-medium text-foreground">{curator.username || curator.name}</span>
              <span>· {items.length} {items.length === 1 ? 'project' : 'projects'}</span>
            </Link>
          )}
        </div>
        {isOwner && (
          <CollectionOwnerTools
            collection={{ id: board.id, name: board.name, description: board.description, is_public: !!board.is_public }}
            profileHref={`${profileHref}?tab=collections`}
          />
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          {isOwner ? 'Nothing here yet. Hit Save on any project page to add it.' : 'This collection is empty.'}
        </div>
      ) : (
        <CollectionItemsGrid items={items} isOwner={isOwner} />
      )}
    </div>
  );
}
