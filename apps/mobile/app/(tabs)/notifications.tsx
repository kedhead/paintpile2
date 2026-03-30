import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
      </View>
      <View style={styles.center}>
        <Text style={styles.placeholder}>Notifications will appear here</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e14' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#1e2430' },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholder: { color: '#6b7280', fontSize: 15 },
});
