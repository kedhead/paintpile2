// Gallery query definitions shared by the server-rendered first page and the
// client-side "load more", so both always agree on what's in the grid.

export type GallerySort = 'trending' | 'popular' | 'latest';

export const GALLERY_SORTS: { id: GallerySort; label: string }[] = [
  { id: 'trending', label: 'Trending' },
  { id: 'popular',  label: 'Popular' },
  { id: 'latest',   label: 'Latest' },
];

export const GALLERY_PAGE_SIZE = 30;
const TRENDING_WINDOW_DAYS = 30;

export function parseGallerySort(value: unknown): GallerySort {
  return value === 'popular' || value === 'latest' ? value : 'trending';
}

export function galleryQuery(sort: GallerySort, extraFilter?: string) {
  const filters = ['is_public = true', 'cover_photo != ""'];
  if (extraFilter) filters.push(`(${extraFilter})`);
  if (sort === 'trending') {
    const since = new Date(Date.now() - TRENDING_WINDOW_DAYS * 86_400_000)
      .toISOString()
      .replace('T', ' ');
    filters.push(`updated >= "${since}"`);
  }
  return {
    filter: filters.join(' && '),
    sort: sort === 'latest' ? '-created' : '-like_count,-comment_count,-created',
    expand: 'user',
  };
}
