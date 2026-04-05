import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C } from '../lib/constants';

interface BiometricLockProps {
  onUnlock: () => void;
}

export function BiometricLock({ onUnlock }: BiometricLockProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.icon}>🔒</Text>
      <Text style={styles.title}>PaintPile is Locked</Text>
      <Text style={styles.subtitle}>Authenticate to continue</Text>
      <TouchableOpacity onPress={onUnlock} style={styles.btn} activeOpacity={0.7}>
        <Text style={styles.btnText}>Unlock</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { color: C.fg, fontSize: 22, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: C.inactive, fontSize: 15, marginBottom: 24 },
  btn: {
    backgroundColor: C.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
