import { useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { C } from '../lib/constants';

interface OAuthModalProps {
  url: string | null;
  onClose: () => void;
  onComplete: () => void;
  paddingTop: number;
}

export function OAuthModal({ url, onClose, onComplete, paddingTop }: OAuthModalProps) {
  const oauthWebViewRef = useRef<WebView>(null);

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
            javaScriptEnabled={true}
            domStorageEnabled={true}
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}
            onNavigationStateChange={(navState) => {
              if (
                navState.url.includes('thepaintpile.com') &&
                !navState.url.includes('accounts.google.com')
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
