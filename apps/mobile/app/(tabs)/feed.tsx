import { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { useDiscoverFeed, getFileUrl } from '@/lib/hooks';
import type { RecordModel } from 'pocketbase';

function PostCard({ post }: { post: RecordModel }) {
  const user = post.expand?.user;
  const avatarUrl = user?.avatar ? getFileUrl(user, user.avatar, '50x50') : null;
  const imageUrl = post.image ? getFileUrl(post, post.image, '600x600') : null;

  return (
    <View className="mb-3 rounded-xl border border-border bg-card p-4">
      {/* Author row */}
      <View className="mb-3 flex-row items-center gap-2">
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} className="h-8 w-8 rounded-full" />
        ) : (
          <View className="h-8 w-8 items-center justify-center rounded-full bg-primary/20">
            <Text className="text-xs font-bold text-primary">
              {(user?.name || '?')[0].toUpperCase()}
            </Text>
          </View>
        )}
        <View className="flex-1">
          <Text className="text-sm font-semibold text-foreground">{user?.name || 'Unknown'}</Text>
          {user?.username && (
            <Text className="text-xs text-muted-foreground">@{user.username}</Text>
          )}
        </View>
      </View>

      {/* Content */}
      {post.content ? (
        <Text className="mb-2 text-sm text-foreground">{post.content}</Text>
      ) : null}

      {/* Image */}
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="aspect-square w-full rounded-lg"
          contentFit="cover"
        />
      ) : null}

      {/* Stats */}
      <View className="mt-3 flex-row gap-4">
        <Text className="text-xs text-muted-foreground">
          ❤️ {post.like_count || 0}
        </Text>
        <Text className="text-xs text-muted-foreground">
          💬 {post.comment_count || 0}
        </Text>
      </View>
    </View>
  );
}

export default function FeedScreen() {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage, refetch, isRefetching } =
    useDiscoverFeed();

  const posts = data?.pages.flatMap((p) => p.items) || [];

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#006bcd" />
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PostCard post={item} />}
      contentContainerClassName="px-4 py-3"
      className="bg-background"
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#006bcd" />
      }
      ListEmptyComponent={
        <View className="items-center py-20">
          <Text className="text-muted-foreground">No posts yet</Text>
        </View>
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator className="py-4" color="#006bcd" />
        ) : null
      }
    />
  );
}
