import { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebView as WebViewType } from 'react-native-webview';
import { C } from '../lib/constants';

// Google blocks OAuth from embedded WebViews by detecting "wv" in the UA.
// Use a standard Chrome mobile UA so Google treats this as a normal browser.
const OAUTH_USER_AGENT = Platform.select({
  android:
    'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
  ios:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
  default:
    'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
});

interface OAuthModalProps {
  url: string | null;
  onClose: () => void;
  onComplete: (oauthResult?: { code: string; state: string }) => void;
  paddingTop: number;
}

export function OAuthModal({ url, onClose, onComplete, paddingTop }: OAuthModalProps) {
  const oauthWebViewRef = useRef<WebViewType>(null);
  const didComplete = useRef(false);

  const handleNavChange = useCallback((navUrl: string) => {
    if (didComplete.current) return;

    // Detect PocketBase's OAuth redirect page — extract code & state from URL
    if (navUrl.includes('/api/oauth2-redirect')) {
      try {
        const parsed = new URL(navUrl);
        const code = parsed.searchParams.get('code');
        const state = parsed.searchParams.get('state');
        if (code && state) {
          didComplete.current = true;
          onClose();
          onComplete({ code, state });
          return;
        }
      } catch {
        // URL parse failed, fall through
      }
    }

    // Fallback: landed back on the site after auth
    if (
      navUrl.includes('thepaintpile.com') &&
      !navUrl.includes('accounts.google.com') &&
      !navUrl.includes('/api/') &&
      !navUrl.includes('/auth/')
    ) {
      didComplete.current = true;
      onClose();
      onComplete();
    }
  }, [onClose, onComplete]);

  return (
    <Modal
      visible={!!url}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      onShow={() => { didComplete.current = false; }}
    >
      <View style={[styles.root, { paddingTop, backgroundColor: C.bg }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Sign in with Google</Text>
          <View style={styles.closeBtn} />
        </View>
        {url && (
          <WebView
            ref={oauthWebViewRef}
            source={{ uri: url }}
            style={styles.webview}
            userAgent={OAUTH_USER_AGENT}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}
            onShouldStartLoadWithRequest={(request) => {
              handleNavChange(request.url);
              return !didComplete.current;
            }}
            onNavigationStateChange={(navState) => {
              handleNavChange(navState.url);
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  webview: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  closeBtn: { width: 60 },
  closeText: { color: C.primary, fontSize: 16, fontWeight: '600' },
  title: { color: C.fg, fontSize: 16, fontWeight: '600' },
});
