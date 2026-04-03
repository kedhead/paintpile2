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

export default function LoginScreen() {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    setError('');
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)/feed');
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      router.replace('/(tabs)/feed');
    } catch (err: any) {
      const msg = err?.message || 'Google sign-in failed';
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
