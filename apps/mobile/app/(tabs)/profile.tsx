import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useAuth } from '@/lib/auth-context';
import { getFileUrl } from '@/lib/hooks';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const avatarUrl = user.avatar ? getFileUrl(user, user.avatar, '200x200') : null;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="px-4 py-6">
      {/* Avatar + Name */}
      <View className="items-center">
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} className="h-24 w-24 rounded-full" />
        ) : (
          <View className="h-24 w-24 items-center justify-center rounded-full bg-primary/20">
            <Text className="text-3xl font-bold text-primary">
              {(user.name || '?')[0].toUpperCase()}
            </Text>
          </View>
        )}
        <Text className="mt-3 text-xl font-bold text-foreground">{user.name}</Text>
        {user.username && (
          <Text className="text-sm text-muted-foreground">@{user.username}</Text>
        )}
        {user.bio ? (
          <Text className="mt-2 text-center text-sm text-muted-foreground">{user.bio}</Text>
        ) : null}
      </View>

      {/* Stats */}
      <View className="mt-6 flex-row justify-around rounded-xl border border-border bg-card p-4">
        {[
          { label: 'Projects', value: user.project_count || 0 },
          { label: 'Followers', value: user.follower_count || 0 },
          { label: 'Following', value: user.following_count || 0 },
        ].map(({ label, value }) => (
          <View key={label} className="items-center">
            <Text className="text-lg font-bold text-foreground">{value}</Text>
            <Text className="text-xs text-muted-foreground">{label}</Text>
          </View>
        ))}
      </View>

      {/* Account Info */}
      <View className="mt-6 rounded-xl border border-border bg-card p-4 gap-3">
        <Text className="text-sm font-semibold text-foreground">Account</Text>
        <View className="flex-row justify-between">
          <Text className="text-sm text-muted-foreground">Email</Text>
          <Text className="text-sm text-foreground">{user.email}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm text-muted-foreground">Plan</Text>
          <Text className="text-sm text-foreground capitalize">{user.subscription || 'Free'}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm text-muted-foreground">Member since</Text>
          <Text className="text-sm text-foreground">
            {new Date(user.created).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        onPress={signOut}
        className="mt-6 items-center rounded-xl border border-red-500/30 py-3"
      >
        <Text className="text-sm font-semibold text-red-400">Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
