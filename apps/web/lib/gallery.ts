// Gallery query definitions shared by the server-rendered first page and the
// client-side "load more", so both always agree on what's in the grid.

export type GallerySort = 'trending' | 'popular' | 'latest';

export const GALLERY_SORTS: { id: GallerySort; label: string }[] = [
  { id: 'popular',  label: 'Popular' },
  { id: 'trending', label: 'Trending' },
  { id: 'latest',   label: 'Latest' },
];

/** What `/` shows with no ?sort= */
export const DEFAULT_GALLERY_SORT: GallerySort = 'popular';

export const GALLERY_PAGE_SIZE = 30;
const TRENDING_WINDOW_DAYS = 30;

export function parseGallerySort(value: unknown): GallerySort {
  return value === 'trending' || value === 'popular' || value === 'latest' ? value : DEFAULT_GALLERY_SORT;
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
