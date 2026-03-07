import PocketBase from 'pocketbase';

let pb: PocketBase | null = null;

export function createPocketBase(url?: string): PocketBase {
  if (pb) return pb;
  pb = new PocketBase(url || process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');
  return pb;
}

export function getPocketBase(): PocketBase {
  if (!pb) {
    throw new Error('PocketBase not initialized. Call createPocketBase() first.');
  }
  return pb;
}

export type { PocketBase };
