import {
  View, Text, Image, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../components/auth-provider';
import { getFileUrl } from '../../lib/pb-helpers';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  if (!user) return null;

  const avatarUrl = user.avatar ? getFileUrl(user, user.avatar, '200x200') : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitial}>
                {(user.name || user.username || '?')[0].toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.name}>{user.name || user.username}</Text>
          {user.username && user.name && (
            <Text style={styles.username}>@{user.username}</Text>
          )}
          {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e14' },
  content: { padding: 20 },
  header: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: 12 },
  avatarFallback: {
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { color: '#fff', fontSize: 36, fontWeight: '700' },
  name: { color: '#f9fafb', fontSize: 22, fontWeight: '700', marginBottom: 2 },
  username: { color: '#6b7280', fontSize: 14, marginBottom: 8 },
  bio: { color: '#9ca3af', fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 4 },
  signOutBtn: {
    marginTop: 32,
    backgroundColor: '#1f2937',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  signOutText: { color: '#ef4444', fontSize: 15, fontWeight: '600' },
});
