import { slugify } from './urls';

/** `/collections/abc123-teal-inspo` — like projects, only the id is read. */
export function collectionPath(collection: { id: string; name?: string }): string {
  const slug = collection.name ? slugify(collection.name) : '';
  return slug ? `/collections/${collection.id}-${slug}` : `/collections/${collection.id}`;
}

export const COLLECTION_NAME_MAX = 60;
