import * as Linking from 'expo-linking';
import type WebView from 'react-native-webview';
import { BASE_URL } from './constants';

export function handleDeepLink(
  url: string,
  webViewRef: React.RefObject<WebView | null>,
) {
  // Support both paintpile:// scheme and https://thepaintpile.com URLs
  let path = '/feed';

  if (url.startsWith('paintpile://')) {
    // paintpile://feed/123 → /feed/123
    const parsed = Linking.parse(url);
    path = parsed.path ? `/${parsed.path}` : '/feed';
  } else if (url.startsWith('https://thepaintpile.com')) {
    // https://thepaintpile.com/projects/123 → /projects/123
    try {
      const u = new URL(url);
      path = u.pathname;
    } catch {
      path = '/feed';
    }
  }

  webViewRef.current?.injectJavaScript(
    `window.location.href = '${BASE_URL}${path}'; true;`,
  );
}
