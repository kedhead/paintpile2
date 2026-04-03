import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/lib/auth-context';

const PB_URL = 'https://thepaintpile.com';

export default function LoginScreen() {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [debug, setDebug] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    setError('');
    setDebug('');

    // Step 1: Test raw fetch to PB health endpoint
    try {
      setDebug('Testing API health...');
      const healthRes = await fetch(`${PB_URL}/api/health`);
      const healthData = await healthRes.text();
      setDebug(`Health: ${healthRes.status} ${healthData}\n`);
    } catch (e: any) {
      setDebug(`Health FAILED: ${e.message}\n`);
      setLoading(false);
      return;
    }

    // Step 2: Test raw fetch to auth endpoint (bypass PB SDK)
    try {
      setDebug(prev => prev + 'Testing raw auth...');
      const authRes = await fetch(`${PB_URL}/api/collections/users/auth-with-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: email.trim(), password }),
      });
      const authData = await authRes.text();
      setDebug(prev => prev + `Auth: ${authRes.status} ${authData.substring(0, 200)}\n`);
    } catch (e: any) {
      setDebug(prev => prev + `Auth FAILED: ${e.message}\n`);
      setLoading(false);
      return;
    }

    // Step 3: Try actual PB SDK login
    try {
      setDebug(prev => prev + 'Trying PB SDK signIn...');
      await signIn(email.trim(), password);
      setDebug(prev => prev + 'SDK SUCCESS');
      router.replace('/(tabs)/feed');
    } catch (err: any) {
      const errDetail = JSON.stringify({
        message: err?.message,
        status: err?.status,
        data: err?.data,
        response: err?.response,
        originalError: err?.originalError?.message,
        name: err?.name,
        url: err?.url,
      }, null, 2);
      setDebug(prev => prev + `SDK FAILED: ${errDetail}`);
      setError(err?.message || JSON.stringify(err));
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    setDebug('');
    try {
      await signInWithGoogle();
      router.replace('/(tabs)/feed');
    } catch (err: any) {
      const errDetail = JSON.stringify({
        message: err?.message,
        status: err?.status,
        data: err?.data,
        response: err?.response,
      }, null, 2);
      setDebug(`Google error: ${errDetail}`);
      const msg = err?.message || JSON.stringify(err);
      if (!msg.includes('cancelled')) setError(msg);
    }
    setGoogleLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerClassName="flex-1 justify-center px-6">
        <View className="items-center mb-10">
          <Text className="text-3xl font-bold text-foreground">PaintPile</Text>
          <Text className="mt-2 text-muted-foreground">Sign in to your account</Text>
        </View>

        {error ? (
          <View className="mb-4 rounded-lg bg-red-900/30 p-3">
            <Text className="text-sm text-red-400">{error}</Text>
          </View>
        ) : null}

        {debug ? (
          <View className="mb-4 rounded-lg bg-blue-900/30 p-3">
            <Text className="text-xs text-blue-300 font-mono">{debug}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={handleGoogleSignIn}
          disabled={googleLoading}
          className="mb-4 flex-row items-center justify-center rounded-lg border border-border bg-card py-3.5"
        >
          {googleLoading ? (
            <ActivityIndicator color="#006bcd" />
          ) : (
            <Text className="text-sm font-semibold text-foreground">Sign in with Google</Text>
          )}
        </TouchableOpacity>

        <View className="mb-4 flex-row items-center">
          <View className="flex-1 h-px bg-border" />
          <Text className="mx-3 text-xs text-muted-foreground">OR</Text>
          <View className="flex-1 h-px bg-border" />
        </View>

        <View className="gap-4">
          <View>
            <Text className="mb-1 text-sm font-medium text-foreground">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#a1a1aa"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className="rounded-lg border border-border bg-card px-4 py-3 text-foreground"
            />
          </View>

          <View>
            <Text className="mb-1 text-sm font-medium text-foreground">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              placeholderTextColor="#a1a1aa"
              secureTextEntry
              className="rounded-lg border border-border bg-card px-4 py-3 text-foreground"
            />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading || !email.trim() || !password}
            className="mt-2 items-center rounded-lg bg-primary py-3.5 disabled:opacity-50"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-sm font-semibold text-white">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-muted-foreground">Don't have an account? </Text>
          <Link href="/auth/signup" asChild>
            <TouchableOpacity>
              <Text className="font-semibold text-primary">Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
