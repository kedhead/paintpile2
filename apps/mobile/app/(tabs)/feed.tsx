import { useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '../../components/auth-provider';
import { getFileUrl } from '../../lib/pb-helpers';

interface Post {
  id: string;
  user: string;
  content: string;
  expand?: { user?: { id: string; name: string; username: string; avatar: string } };
  created: string;
}

function PostCard({ post }: { post: Post }) {
  const author = post.expand?.user;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {author?.avatar ? (
          <Image
            source={{ uri: getFileUrl(author, author.avatar, '50x50') }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]} />
        )}
        <View>
          <Text style={styles.authorName}>{author?.name || 'Unknown'}</Text>
          {author?.username && (
            <Text style={styles.authorUsername}>@{author.username}</Text>
          )}
        </View>
      </View>
      {post.content ? (
        <Text style={styles.cardContent}>{post.content}</Text>
      ) : null}
    </View>
  );
}

export default function FeedScreen() {
  const { pb } = useAuth();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['posts', 'discover'],
    queryFn: async ({ pageParam = 1 }) => {
      return pb.collection('posts').getList(pageParam, 20, {
        filter: 'is_public = true',
        sort: '-created',
        expand: 'user',
      });
    },
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    initialPageParam: 1,
  });

  const posts = data?.pages.flatMap((p) => p.items) ?? [];

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color="#d946ef" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Paintpile</Text>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <PostCard post={item as Post} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#d946ef"
          />
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={{ padding: 16 }} color="#d946ef" />
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e14' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0e14' },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2430',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  card: {
    backgroundColor: '#111827',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e2430',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: { backgroundColor: '#374151' },
  authorName: { color: '#f9fafb', fontSize: 14, fontWeight: '600' },
  authorUsername: { color: '#6b7280', fontSize: 12, marginTop: 1 },
  cardContent: { color: '#d1d5db', fontSize: 14, lineHeight: 20 },
});
