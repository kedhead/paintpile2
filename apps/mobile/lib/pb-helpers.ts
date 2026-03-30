const PB_URL =
  process.env.EXPO_PUBLIC_POCKETBASE_URL || 'https://thepaintpile.com';

/** Build a PocketBase file URL with optional thumb size e.g. "100x100" */
export function getFileUrl(
  record: { id: string; collectionId?: string; collectionName?: string },
  filename: string,
  thumb?: string,
): string {
  const collection = record.collectionId || record.collectionName;
  const base = `${PB_URL}/api/files/${collection}/${record.id}/${encodeURIComponent(filename)}`;
  return thumb ? `${base}?thumb=${thumb}` : base;
}
