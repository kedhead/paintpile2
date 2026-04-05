import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { BASE_URL } from './constants';

const EXPO_TOKEN_KEY = 'expo-push-token';

// Configure how notifications are shown when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) return null;

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  return token;
}

export async function sendTokenToServer(expoPushToken: string, pbAuthToken: string) {
  try {
    await fetch(`${BASE_URL}/api/notifications/subscribe-expo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expoPushToken,
        pbToken: pbAuthToken,
      }),
    });
  } catch (err) {
    console.error('Failed to register push token:', err);
  }
}

export async function storeExpoPushToken(token: string) {
  await SecureStore.setItemAsync(EXPO_TOKEN_KEY, token);
}

export async function getStoredExpoPushToken(): Promise<string | null> {
  return SecureStore.getItemAsync(EXPO_TOKEN_KEY);
}
