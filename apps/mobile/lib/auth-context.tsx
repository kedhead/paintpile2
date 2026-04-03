import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { RecordModel } from 'pocketbase';
import * as WebBrowser from 'expo-web-browser';
import {
  getClient,
  rawSignIn,
  rawSignUp,
  rawSignOut,
  rawAuthRefresh,
  rawListAuthMethods,
  rawAuthWithOAuth2Code,
} from './pocketbase';

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
    const check = async () => {
      if (pb.authStore.isValid && pb.authStore.token) {
        try {
          const result = await rawAuthRefresh(pb.authStore.token);
          setUser(result.record);
        } catch {
          await rawSignOut();
          setUser(null);
        }
      }
      setLoading(false);
    };
    check();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await rawSignIn(email, password);
    setUser(result.record);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    // Get auth methods via raw fetch
    const authMethods = await rawListAuthMethods();
    const providers = authMethods.oauth2?.providers || authMethods.authProviders || [];
    const googleProvider = providers.find(
      (p: { name: string }) => p.name === 'google'
    );
    if (!googleProvider) throw new Error('Google auth not configured');

    // Use HTTPS redirect through the web app, which then deep-links back
    const redirectUrl = 'https://thepaintpile.com/auth/mobile-callback';

    // Build the Google OAuth URL with our HTTPS redirect
    const authUrl =
      (googleProvider.authURL || googleProvider.authUrl) + encodeURIComponent(redirectUrl);

    // Open browser — WebBrowser will intercept the deep link back to paintpile://
    const result = await WebBrowser.openAuthSessionAsync(
      authUrl,
      'paintpile://oauth'
    );

    if (result.type !== 'success' || !result.url) {
      throw new Error('Google sign-in was cancelled');
    }

    // Extract code from the deep link URL
    const url = new URL(result.url);
    const code = url.searchParams.get('code');
    if (!code) throw new Error('No auth code received');

    // Exchange code for PocketBase auth via raw fetch
    const authResult = await rawAuthWithOAuth2Code(
      'google',
      code,
      googleProvider.codeVerifier,
      redirectUrl,
    );
    setUser(authResult.record);
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string, username: string) => {
    const result = await rawSignUp(email, password, name, username);
    setUser(result.record);
  }, []);

  const signOut = useCallback(async () => {
    await rawSignOut();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    if (pb.authStore.isValid && pb.authStore.token) {
      try {
        const result = await rawAuthRefresh(pb.authStore.token);
        setUser(result.record);
      } catch {
        await rawSignOut();
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
