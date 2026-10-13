import { cookies } from 'next/headers';
import PocketBase, { type RecordModel } from 'pocketbase';

export const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thepaintpile.com';

/** Anonymous client — what a logged-out visitor or a search crawler sees. */
export function publicPb(): PocketBase {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);
  return pb;
}

/** Id of the signed-in viewer, read from the `pb_auth` cookie's JWT payload.
 * Only used to decide what to render; PocketBase still enforces access. */
export async function getViewerId(): Promise<string | null> {
  const token = (await cookies()).get('pb_auth')?.value;
  if (!token) return null;
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return typeof payload.id === 'string' ? payload.id : null;
  } catch {
    return null;
  }
}

/** Client carrying the viewer's token, for reading their own private records. */
export async function viewerPb(): Promise<PocketBase> {
  const pb = publicPb();
  const token = (await cookies()).get('pb_auth')?.value;
  if (token) pb.authStore.save(token, null);
  return pb;
}

export function fileUrl(record: RecordModel, filename: string, thumb?: string): string {
  const url = `${PB_URL}/api/files/${record.collectionId}/${record.id}/${filename}`;
  return thumb ? `${url}?thumb=${thumb}` : url;
}

/** Run a PocketBase read, returning `fallback` on any error (missing record,
 * missing collection, access rule denial). Public pages degrade, never crash. */
export async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}
