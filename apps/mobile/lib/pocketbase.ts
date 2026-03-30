import PocketBase, { AsyncAuthStore } from 'pocketbase';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'pb_auth';

// SecureStore is the React Native equivalent of httpOnly cookies —
// values are encrypted on-device and never exposed to other apps.
const store = new AsyncAuthStore({
  save: async (serialized: string) => {
    await SecureStore.setItemAsync(STORAGE_KEY, serialized);
  },
  initial: SecureStore.getItemAsync(STORAGE_KEY),
  clear: async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  },
});

// Singleton — same pattern as the web lib/pocketbase.ts
let pb: PocketBase | null = null;

export function getClient(): PocketBase {
  if (pb) return pb;
  const url =
    process.env.EXPO_PUBLIC_POCKETBASE_URL ||
    'https://thepaintpile.com';
  pb = new PocketBase(url, store);
  return pb;
}
