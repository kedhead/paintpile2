import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { useNotifications, getFileUrl } from '@/lib/hooks';
import { getClient } from '@/lib/pocketbase';
import type { RecordModel } from 'pocketbase';

const typeLabels: Record<string, string> = {
  like: '❤️ liked your',
  comment: '💬 commented on your',
  follow: '👤 started following you',
  mention: '📣 mentioned you in',
  news: '📰 New update:',
};

function NotificationItem({ item }: { item: RecordModel }) {
  const actor = item.expand?.actor;
  const avatarUrl = actor?.avatar ? getFileUrl(actor, actor.avatar, '50x50') : null;
  const isUnread = !item.read;

  return (
    <View
      className={`mx-4 mb-2 flex-row items-start gap-3 rounded-lg border p-3 ${
        isUnread ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
      }`}
    >
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} className="h-9 w-9 rounded-full" />
      ) : (
        <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/20">
          <Text className="text-xs font-bold text-primary">
            {(actor?.name || '?')[0].toUpperCase()}
          </Text>
        </View>
      )}
      <View className="flex-1">
        <Text className="text-sm text-foreground">
          <Text className="font-semibold">{actor?.name || 'Someone'}</Text>{' '}
          {item.message || typeLabels[item.type] || item.type}
        </Text>
        <Text className="mt-1 text-xs text-muted-foreground">
          {new Date(item.created).toLocaleDateString()}
        </Text>
      </View>
      {isUnread && <View className="mt-1.5 h-2 w-2 rounded-full bg-primary" />}
    </View>
  );
}

export default function NotificationsScreen() {
  const { data: notifications, isLoading, refetch, isRefetching } = useNotifications();

  // Mark all as read on screen open
  const pb = getClient();
  if (notifications?.length) {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length > 0) {
      Promise.all(
        unread.map((n) => pb.collection('notifications').update(n.id, { read: true }).catch(() => {}))
      );
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#006bcd" />
      </View>
    );
  }

  return (
    <FlatList
      data={notifications || []}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <NotificationItem item={item} />}
      contentContainerClassName="py-3"
      className="bg-background"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#006bcd" />
      }
      ListEmptyComponent={
        <View className="items-center py-20">
          <Text style={{ fontSize: 32 }}>🔔</Text>
          <Text className="mt-3 text-muted-foreground">No notifications yet</Text>
        </View>
      }
    />
  );
}
