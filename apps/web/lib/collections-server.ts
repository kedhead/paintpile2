import type PocketBase from 'pocketbase';
import type { RecordModel } from 'pocketbase';
import { fileUrl, safe } from './pb-server';
import { collectionPath } from './collections';
import { profilePath } from './urls';
import type { CollectionCardData } from '../components/collections/collection-card';

/**
 * Turn collection records into mosaic cards: up to three cover photos from the
 * most recently saved public projects, plus a count. One items query for the
 * whole page instead of one per collection.
 */
export async function buildCollectionCards(pb: PocketBase, boards: RecordModel[]): Promise<CollectionCardData[]> {
  if (!boards.length) return [];
  const items = await safe(
    () =>
      pb.collection('project_collection_items').getFullList({
        filter: boards.map((b) => pb.filter('collection = {:id}', { id: b.id })).join(' || '),
        expand: 'project',
        sort: '-created',
      }),
    [] as RecordModel[],
  );

  const byBoard = new Map<string, RecordModel[]>();
  for (const item of items) {
    const project = item.expand?.project as RecordModel | undefined;
    // Skip projects the viewer can't see (made private after being saved).
    if (!project) continue;
    const list = byBoard.get(item.collection as string) ?? [];
    list.push(project);
    byBoard.set(item.collection as string, list);
  }

  return boards.map((board) => {
    const projects = byBoard.get(board.id) ?? [];
    const curator = board.expand?.user as RecordModel | undefined;
    return {
      id: board.id,
      href: collectionPath(board),
      name: board.name,
      isPublic: !!board.is_public,
      count: projects.length,
      images: projects
        .filter((p) => p.cover_photo)
        .slice(0, 3)
        .map((p, i) => fileUrl(p, p.cover_photo, i === 0 ? '600x600' : '300x300')),
      curator: curator ? { name: curator.username || curator.name, href: profilePath(curator) } : null,
    };
  });
}
