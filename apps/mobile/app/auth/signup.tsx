import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../components/auth-provider';

export default function SignupScreen() {
  const { pb } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await pb.collection('users').create({
        name,
        email: email.trim().toLowerCase(),
        password,
        passwordConfirm: password,
      });
      await pb.collection('users').authWithPassword(email.trim().toLowerCase(), password);
      // AuthGate redirects to feed once user is set
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign up failed';
      setError(msg.includes('email') ? 'Email already in use' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>Paintpile</Text>
        <Text style={styles.tagline}>Join the community</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Display name"
          placeholderTextColor="#6b7280"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#6b7280"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#6b7280"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.btn} onPress={handleSignup} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <Link href="/auth/login" asChild>
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkBold}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e14' },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: { color: '#f9fafb', fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  tagline: { color: '#6b7280', fontSize: 14, textAlign: 'center', marginBottom: 32 },
  error: {
    color: '#f87171',
    fontSize: 13,
    backgroundColor: '#450a0a',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#111827',
    color: '#f9fafb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e2430',
  },
  btn: {
    backgroundColor: '#d946ef',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkRow: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#6b7280', fontSize: 14 },
  linkBold: { color: '#d946ef', fontWeight: '600' },
});
