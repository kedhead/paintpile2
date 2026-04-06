import { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  AppState,
  type AppStateStatus,
} from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import type { WebViewOpenWindowEvent } from 'react-native-webview/lib/WebViewTypes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Network from 'expo-network';
import * as Linking from 'expo-linking';
import { BASE_URL, TABS, C, type Tab } from '../lib/constants';
import { buildInjectedJS, type BridgeMessage, type CachedPost } from '../lib/bridge';
import { triggerHaptic } from '../lib/haptics';
import { showNativeShare } from '../lib/share';
import { showImagePicker } from '../lib/image-picker';
import { cacheFeedData, getCachedFeed } from '../lib/offline-cache';
import { handleDeepLink } from '../lib/deep-linking';
import {
  registerForPushNotifications,
  sendTokenToServer,
  storeExpoPushToken,
  getStoredExpoPushToken,
} from '../lib/notifications';
import {
  isBiometricAvailable,
  isBiometricEnabled,
  authenticateWithBiometrics,
  storeAuthToken,
} from '../lib/biometric';
import { TabBar } from '../components/TabBar';
import { OAuthModal } from '../components/OAuthModal';
import { OfflineFeed } from '../components/OfflineFeed';
import { BiometricLock } from '../components/BiometricLock';

const INJECTED_JS = buildInjectedJS();

export default function AppScreen() {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  // ── Core state ──
  const [activeTab, setActiveTab] = useState('home');
  const [isOffline, setIsOffline] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [ready, setReady] = useState(false);

  // ── OAuth ──
  const [oauthUrl, setOauthUrl] = useState<string | null>(null);

  // ── Offline cache ──
  const [cachedPosts, setCachedPosts] = useState<CachedPost[] | null>(null);

  // ── Auth token (for push + biometric) ──
  const [pbToken, setPbToken] = useState<string | null>(null);
  const pushRegistered = useRef(false);

  // ── Biometric lock ──
  const [isLocked, setIsLocked] = useState(false);

  // ── Network check ──
  const checkNetwork = useCallback(async () => {
    try {
      const state = await Network.getNetworkStateAsync();
      const offline = !state.isConnected || !state.isInternetReachable;
      setIsOffline(offline);

      if (offline) {
        const cached = await getCachedFeed();
        setCachedPosts(cached);
      }
    } catch {
      setIsOffline(false);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    checkNetwork();
  }, [checkNetwork]);

  // ── Deep linking ──
  useEffect(() => {
    // Handle cold start deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url, webViewRef);
    });

    // Handle warm start deep links
    const sub = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url, webViewRef);
    });
    return () => sub.remove();
  }, []);

  // ── Biometric lock on app foreground ──
  useEffect(() => {
    const handleAppState = async (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        const available = await isBiometricAvailable();
        const enabled = await isBiometricEnabled();
        if (available && enabled) {
          setIsLocked(true);
        }
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, []);

  const handleBiometricUnlock = useCallback(async () => {
    const success = await authenticateWithBiometrics();
    if (success) setIsLocked(false);
  }, []);

  // Auto-prompt biometric on lock
  useEffect(() => {
    if (isLocked) handleBiometricUnlock();
  }, [isLocked, handleBiometricUnlock]);

  // ── Push notification registration ──
  useEffect(() => {
    if (!pbToken || pushRegistered.current) return;

    (async () => {
      const existingToken = await getStoredExpoPushToken();
      if (existingToken) {
        // Already registered, just update server
        await sendTokenToServer(existingToken, pbToken);
        pushRegistered.current = true;
        return;
      }

      const token = await registerForPushNotifications();
      if (token) {
        await storeExpoPushToken(token);
        await sendTokenToServer(token, pbToken);
        pushRegistered.current = true;
      }
    })();
  }, [pbToken]);

  // ── Tab press ──
  const handleTabPress = useCallback((tab: Tab) => {
    triggerHaptic('tab_press');
    setActiveTab(tab.key);
    webViewRef.current?.injectJavaScript(
      `window.location.href = '${BASE_URL}${tab.path}'; true;`,
    );
  }, []);

  // ── OAuth popup ──
  const handleOpenWindow = useCallback((event: WebViewOpenWindowEvent) => {
    setOauthUrl(event.nativeEvent.targetUrl);
  }, []);

  // ── Message router ──
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data: BridgeMessage = JSON.parse(event.nativeEvent.data);

      switch (data.type) {
        case 'nav': {
          const match = TABS.find((t) => data.url.startsWith(t.path));
          if (match) setActiveTab(match.key);
          break;
        }

        case 'haptic':
          triggerHaptic(data.action);
          break;

        case 'share':
          triggerHaptic('share');
          showNativeShare(data);
          break;

        case 'file_input_click':
          triggerHaptic('tab_press');
          showImagePicker(webViewRef, data.multiple);
          break;

        case 'feed_data':
          cacheFeedData(data.posts);
          break;

        case 'auth_token':
          setPbToken(data.token);
          storeAuthToken(data.token);
          break;
      }
    } catch {
      // Ignore non-JSON messages
    }
  }, []);

  // ── Splash / loading ──
  if (!ready) {
    return (
      <View style={[styles.centered, { backgroundColor: C.bg }]}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  // ── Offline ──
  if (isOffline) {
    if (cachedPosts && cachedPosts.length > 0) {
      return (
        <OfflineFeed
          posts={cachedPosts}
          onRetry={checkNetwork}
          paddingTop={insets.top}
          paddingBottom={Math.max(insets.bottom, 8)}
        />
      );
    }

    return (
      <View style={[styles.offline, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <Text style={styles.offlineIcon}>📡</Text>
        <Text style={styles.offlineTitle}>You're Offline</Text>
        <Text style={styles.offlineMsg}>
          Please check your internet connection and try again.
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={checkNetwork} activeOpacity={0.8}>
          <Text style={styles.retryTxt}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main app ──
  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      {/* WebView */}
      <View style={[styles.webviewWrap, { paddingTop: insets.top }]}>
        <WebView
          ref={webViewRef}
          source={{ uri: `${BASE_URL}/feed` }}
          style={styles.webview}
          // Cookies & session
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
          // JS & storage
          javaScriptEnabled={true}
          domStorageEnabled={true}
          // Bridge
          injectedJavaScript={INJECTED_JS}
          onMessage={handleMessage}
          // Media
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          // Loading
          onLoadEnd={() => setIsFirstLoad(false)}
          // Error
          onError={() => checkNetwork()}
          // Cache
          cacheEnabled={true}
          cacheMode="LOAD_DEFAULT"
          // OAuth popups
          setSupportMultipleWindows={true}
          javaScriptCanOpenWindowsAutomatically={true}
          onOpenWindow={handleOpenWindow}
          // Gestures
          pullToRefreshEnabled={true}
          allowsBackForwardNavigationGestures={true}
        />

        {isFirstLoad && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={C.primary} />
          </View>
        )}
      </View>

      {/* Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onTabPress={handleTabPress}
        paddingBottom={Math.max(insets.bottom, 8)}
      />

      {/* OAuth Modal */}
      <OAuthModal
        url={oauthUrl}
        onClose={() => setOauthUrl(null)}
        onComplete={(oauthResult) => {
          if (oauthResult?.code && oauthResult?.state) {
            // Inject the OAuth result back into the main WebView.
            // The PB SDK is listening for a postMessage with {code, state}
            // from the popup it opened — we simulate that message.
            webViewRef.current?.injectJavaScript(`
              window.postMessage(${JSON.stringify(oauthResult)}, '*');
              true;
            `);
          } else {
            // Fallback: just reload to pick up any cookie-based auth
            webViewRef.current?.reload();
          }
        }}
        paddingTop={insets.top}
      />

      {/* Biometric Lock */}
      {isLocked && <BiometricLock onUnlock={handleBiometricUnlock} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // WebView
  webviewWrap: { flex: 1 },
  webview: { flex: 1, backgroundColor: C.bg },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 10, 24, 0.85)',
  },

  // Offline
  offline: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  offlineIcon: { fontSize: 48, marginBottom: 16 },
  offlineTitle: { fontSize: 22, fontWeight: '700', color: C.fg, marginBottom: 8 },
  offlineMsg: {
    fontSize: 15,
    color: C.inactive,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryTxt: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
