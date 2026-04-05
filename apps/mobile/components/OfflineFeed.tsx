import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { C } from '../lib/constants';
import type { CachedPost } from '../lib/bridge';

interface OfflineFeedProps {
  posts: CachedPost[];
  onRetry: () => void;
  paddingTop: number;
  paddingBottom: number;
}

export function OfflineFeed({ posts, onRetry, paddingTop, paddingBottom }: OfflineFeedProps) {
  return (
    <View style={[styles.root, { paddingTop }]}>
      {/* Offline banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerIcon}>📡</Text>
        <View style={styles.bannerTextWrap}>
          <Text style={styles.bannerTitle}>You're Offline</Text>
          <Text style={styles.bannerSub}>Showing cached content</Text>
        </View>
        <TouchableOpacity onPress={onRetry} style={styles.retryBtn} activeOpacity={0.7}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Author row */}
            <View style={styles.authorRow}>
              {item.authorAvatar ? (
                <Image source={{ uri: item.authorAvatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarLetter}>
                    {item.authorName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={styles.authorName}>{item.authorName}</Text>
            </View>

            {/* Content */}
            {item.content ? (
              <Text style={styles.content} numberOfLines={6}>
                {item.content}
              </Text>
            ) : null}

            {/* Images */}
            {item.images.length > 0 && (
              <View style={styles.imageGrid}>
                {item.images.slice(0, 2).map((uri, i) => (
                  <Image
                    key={i}
                    source={{ uri }}
                    style={[
                      styles.postImage,
                      item.images.length === 1 && styles.postImageFull,
                    ]}
                    contentFit="cover"
                    placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  bannerIcon: { fontSize: 20, marginRight: 10 },
  bannerTextWrap: { flex: 1 },
  bannerTitle: { color: C.fg, fontSize: 14, fontWeight: '700' },
  bannerSub: { color: C.inactive, fontSize: 12, marginTop: 1 },
  retryBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryText: { color: '#FFF', fontSize: 13, fontWeight: '600' },

  // Card
  card: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  avatarPlaceholder: {
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  authorName: { color: C.fg, fontSize: 14, fontWeight: '600' },
  content: { color: C.fg, fontSize: 14, lineHeight: 20, marginBottom: 8 },
  imageGrid: { flexDirection: 'row', gap: 4, borderRadius: 8, overflow: 'hidden' },
  postImage: { flex: 1, height: 180, borderRadius: 8 },
  postImageFull: { height: 240 },
});
