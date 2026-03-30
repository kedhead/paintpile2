import PocketBase from 'pocketbase';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const PB_URL =
  Constants.expoConfig?.extra?.pocketbaseUrl ||
  process.env.EXPO_PUBLIC_POCKETBASE_URL ||
  'https://thepaintpile.com:8090';

const TOKEN_KEY = 'pb_auth_token';
const MODEL_KEY = 'pb_auth_model';

let pb: PocketBase;

export function getClient(): PocketBase {
  if (pb) return pb;

  pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);

  // Restore saved auth on first load
  restoreAuth();

  // Persist auth changes to SecureStore
  pb.authStore.onChange(async (token, record) => {
    try {
      if (token) {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        await SecureStore.setItemAsync(MODEL_KEY, JSON.stringify(record));
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(MODEL_KEY);
      }
    } catch {
      // SecureStore may fail on some devices — non-critical
    }
  });

  return pb;
}

async function restoreAuth() {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const modelStr = await SecureStore.getItemAsync(MODEL_KEY);
    if (token && modelStr) {
      const model = JSON.parse(modelStr);
      pb.authStore.save(token, model);
      // Verify token is still valid
      await pb.collection('users').authRefresh();
    }
  } catch {
    // Token expired or invalid — clear it
    pb.authStore.clear();
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    await SecureStore.deleteItemAsync(MODEL_KEY).catch(() => {});
  }
}

export function getFileUrl(
  record: { id: string; collectionId: string; collectionName: string },
  filename: string,
  thumb?: string
): string {
  if (!filename) return '';
  const base = `${PB_URL}/api/files/${record.collectionId}/${record.id}/${filename}`;
  return thumb ? `${base}?thumb=${thumb}` : base;
}
