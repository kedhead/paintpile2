import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const HAPTIC_MAP: Record<string, () => void> = {
  like: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  post_created: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  comment: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  share: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  tab_press: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
};

export function triggerHaptic(action: string) {
  if (Platform.OS === 'web') return;
  const handler = HAPTIC_MAP[action];
  if (handler) handler();
}
