import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CachedPost } from './bridge';

const CACHE_KEY = '@paintpile/cached-feed';

export async function cacheFeedData(posts: CachedPost[]) {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(posts));
  } catch {
    // Silently fail — caching is best-effort
  }
}

export async function getCachedFeed(): Promise<CachedPost[] | null> {
  try {
    const data = await AsyncStorage.getItem(CACHE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}
