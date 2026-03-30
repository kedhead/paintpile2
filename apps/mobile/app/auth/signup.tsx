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

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !username.trim() || !email.trim() || !password) return;
    setLoading(true);
    setError('');
    try {
      await signUp(email.trim(), password, name.trim(), username.trim().toLowerCase());
      router.replace('/(tabs)/feed');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Signup failed';
      if (msg.includes('unique')) {
        setError('That email or username is already taken.');
      } else {
        setError(msg);
      }
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerClassName="flex-1 justify-center px-6">
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-foreground">PaintPile</Text>
          <Text className="mt-2 text-muted-foreground">Create your account</Text>
        </View>

        {error ? (
          <View className="mb-4 rounded-lg bg-red-900/30 p-3">
            <Text className="text-sm text-red-400">{error}</Text>
          </View>
        ) : null}

        <View className="gap-4">
          <View>
            <Text className="mb-1 text-sm font-medium text-foreground">Display Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor="#a1a1aa"
              className="rounded-lg border border-border bg-card px-4 py-3 text-foreground"
            />
          </View>

          <View>
            <Text className="mb-1 text-sm font-medium text-foreground">Username</Text>
            <TextInput
              value={username}
              onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="my_username"
              placeholderTextColor="#a1a1aa"
              autoCapitalize="none"
              autoCorrect={false}
              className="rounded-lg border border-border bg-card px-4 py-3 text-foreground"
            />
          </View>

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
              placeholder="Min 6 characters"
              placeholderTextColor="#a1a1aa"
              secureTextEntry
              className="rounded-lg border border-border bg-card px-4 py-3 text-foreground"
            />
          </View>

          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading || !name.trim() || !username.trim() || !email.trim() || password.length < 6}
            className="mt-2 items-center rounded-lg bg-primary py-3.5 disabled:opacity-50"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-sm font-semibold text-white">Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-muted-foreground">Already have an account? </Text>
          <Link href="/auth/login" asChild>
            <TouchableOpacity>
              <Text className="font-semibold text-primary">Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
