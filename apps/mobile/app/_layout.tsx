import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/lib/auth-context';
import { queryClient } from '@/lib/query-client';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth" />
          <Stack.Screen
            name="project/[id]"
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: '#0a0a0a' },
              headerTintColor: '#fafafa',
              headerTitle: 'Project',
              presentation: 'card',
            }}
          />
        </Stack>
        <StatusBar style="light" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
