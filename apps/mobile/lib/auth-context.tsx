import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { RecordModel } from 'pocketbase';
import * as WebBrowser from 'expo-web-browser';
import { getClient } from './pocketbase';

interface AuthContextType {
  user: RecordModel | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, name: string, username: string) => Promise<void>;
  signOut: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signUp: async () => {},
  signOut: () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<RecordModel | null>(null);
  const [loading, setLoading] = useState(true);
  const pb = getClient();

  useEffect(() => {
    // Check initial auth state
    const check = async () => {
      if (pb.authStore.isValid) {
        try {
          const result = await pb.collection('users').authRefresh();
          setUser(result.record);
        } catch {
          pb.authStore.clear();
          setUser(null);
        }
      }
      setLoading(false);
    };
    check();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await pb.collection('users').authWithPassword(email, password);
    setUser(result.record);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    // PocketBase OAuth2 flow: get auth methods, open browser, exchange code
    const authMethods = await pb.collection('users').listAuthMethods();
    const googleProvider = authMethods.oauth2?.providers?.find(
      (p: { name: string }) => p.name === 'google'
    );
    if (!googleProvider) throw new Error('Google auth not configured');

    // Use HTTPS redirect through the web app, which then deep-links back
    const redirectUrl = 'https://thepaintpile.com/auth/mobile-callback';

    // Build the Google OAuth URL with our HTTPS redirect
    const authUrl =
      googleProvider.authURL + encodeURIComponent(redirectUrl);

    // Open browser — WebBrowser will intercept the deep link back to paintpile://
    const result = await WebBrowser.openAuthSessionAsync(
      authUrl,
      'paintpile://oauth' // The scheme to listen for when the web page redirects
    );

    if (result.type !== 'success' || !result.url) {
      throw new Error('Google sign-in was cancelled');
    }

    // Extract code from the deep link URL
    const url = new URL(result.url);
    const code = url.searchParams.get('code');
    if (!code) throw new Error('No auth code received');

    // Exchange code for PocketBase auth — must use the same redirectUrl we sent to Google
    const authResult = await pb.collection('users').authWithOAuth2Code(
      'google',
      code,
      googleProvider.codeVerifier,
      redirectUrl,
    );
    setUser(authResult.record);
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string, username: string) => {
    await pb.collection('users').create({
      email,
      password,
      passwordConfirm: password,
      name,
      username,
    });
    // Auto sign-in after signup
    const result = await pb.collection('users').authWithPassword(email, password);
    setUser(result.record);
  }, []);

  const signOut = useCallback(() => {
    pb.authStore.clear();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    if (pb.authStore.isValid) {
      try {
        const result = await pb.collection('users').authRefresh();
        setUser(result.record);
      } catch {
        pb.authStore.clear();
        setUser(null);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithGoogle, signUp, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
