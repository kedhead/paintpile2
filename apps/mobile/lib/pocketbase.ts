import PocketBase from 'pocketbase';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

export const PB_URL =
  Constants.expoConfig?.extra?.pocketbaseUrl ||
  process.env.EXPO_PUBLIC_POCKETBASE_URL ||
  'https://thepaintpile.com';

const TOKEN_KEY = 'pb_auth_token';
const MODEL_KEY = 'pb_auth_model';

let pb: PocketBase;

export function getClient(): PocketBase {
  if (pb) return pb;

  pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);

  // Restore saved auth on first load
  restoreAuth();

  return pb;
}

/**
 * Raw fetch wrapper for PocketBase API calls.
 * Bypasses the PB SDK which has Hermes compatibility issues.
 */
async function pbFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${PB_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || `Request failed with status ${res.status}`);
    (err as any).status = res.status;
    (err as any).data = data.data || {};
    throw err;
  }
  return data;
}

/** Sign in with email/password using raw fetch */
export async function rawSignIn(identity: string, password: string) {
  const data = await pbFetch('/api/collections/users/auth-with-password', {
    method: 'POST',
    body: JSON.stringify({ identity, password }),
  });
  // Save to PB authStore so the SDK works for subsequent data queries
  pb.authStore.save(data.token, data.record);
  await persistAuth(data.token, data.record);
  return data;
}

/** Sign up a new user using raw fetch */
export async function rawSignUp(email: string, password: string, name: string, username: string) {
  await pbFetch('/api/collections/users/records', {
    method: 'POST',
    body: JSON.stringify({ email, password, passwordConfirm: password, name, username }),
  });
  // Auto sign-in after signup
  return rawSignIn(email, password);
}

/** Refresh auth token using raw fetch */
export async function rawAuthRefresh(token: string) {
  const data = await pbFetch('/api/collections/users/auth-refresh', {
    method: 'POST',
    headers: { 'Authorization': token },
  });
  pb.authStore.save(data.token, data.record);
  await persistAuth(data.token, data.record);
  return data;
}

/** Get OAuth2 auth methods using raw fetch */
export async function rawListAuthMethods() {
  return pbFetch('/api/collections/users/auth-methods');
}

/** Exchange OAuth2 code for auth using raw fetch */
export async function rawAuthWithOAuth2Code(
  provider: string,
  code: string,
  codeVerifier: string,
  redirectURL: string,
) {
  const data = await pbFetch('/api/collections/users/auth-with-oauth2', {
    method: 'POST',
    body: JSON.stringify({ provider, code, codeVerifier, redirectURL }),
  });
  pb.authStore.save(data.token, data.record);
  await persistAuth(data.token, data.record);
  return data;
}

/** Clear auth state */
export async function rawSignOut() {
  pb.authStore.clear();
  await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
  await SecureStore.deleteItemAsync(MODEL_KEY).catch(() => {});
}

/** Persist auth to SecureStore */
async function persistAuth(token: string, record: any) {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(MODEL_KEY, JSON.stringify(record));
  } catch {
    // SecureStore may fail on some devices — non-critical
  }
}

/** Restore auth from SecureStore on app launch */
async function restoreAuth() {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const modelStr = await SecureStore.getItemAsync(MODEL_KEY);
    if (token && modelStr) {
      const model = JSON.parse(modelStr);
      pb.authStore.save(token, model);
      // Verify token is still valid
      await rawAuthRefresh(token);
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
