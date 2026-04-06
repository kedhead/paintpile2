import { useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
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

// JS injected into the OAuth modal WebView.
// PocketBase's /api/oauth2-redirect page tries window.opener.postMessage({state, code}).
// Since window.opener is null in a separate WebView, we intercept it and bridge
// the result back to native via ReactNativeWebView.postMessage.
const OAUTH_BRIDGE_JS = `
(function() {
  // Watch for PocketBase's OAuth redirect page
  function checkRedirect() {
    var url = window.location.href;
    if (url.indexOf('/api/oauth2-redirect') !== -1) {
      // Extract code and state from URL params
      var params = new URLSearchParams(window.location.search);
      var code = params.get('code');
      var state = params.get('state');
      if (code && state) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'oauth_result',
          code: code,
          state: state,
        }));
      }
    }
  }

  // Also intercept window.opener.postMessage which PB redirect page calls
  window.opener = {
    postMessage: function(data) {
      if (data && data.code && data.state) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'oauth_result',
          code: data.code,
          state: data.state,
        }));
      }
    }
  };

  // Check on load in case we're already on the redirect page
  checkRedirect();
  // Also check on navigation
  var origPush = history.pushState;
  history.pushState = function() { origPush.apply(this, arguments); checkRedirect(); };
  var origReplace = history.replaceState;
  history.replaceState = function() { origReplace.apply(this, arguments); checkRedirect(); };
})();
true;
`;

interface OAuthModalProps {
  url: string | null;
  onClose: () => void;
  onComplete: (oauthResult?: { code: string; state: string }) => void;
  paddingTop: number;
}

export function OAuthModal({ url, onClose, onComplete, paddingTop }: OAuthModalProps) {
  const oauthWebViewRef = useRef<WebViewType>(null);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'oauth_result' && data.code && data.state) {
        onClose();
        onComplete({ code: data.code, state: data.state });
      }
    } catch {
      // ignore non-JSON messages
    }
  };

  return (
    <Modal
      visible={!!url}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
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
            injectedJavaScript={OAUTH_BRIDGE_JS}
            onMessage={handleMessage}
            onNavigationStateChange={(navState) => {
              // Fallback: if we somehow land back on the site without the bridge firing
              if (
                navState.url.includes('thepaintpile.com') &&
                !navState.url.includes('accounts.google.com') &&
                !navState.url.includes('/api/oauth2-redirect') &&
                !navState.url.includes('/auth/')
              ) {
                onClose();
                onComplete();
              }
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
