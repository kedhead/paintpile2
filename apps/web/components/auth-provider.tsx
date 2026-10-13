'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import PocketBase, { type RecordModel } from 'pocketbase';
import { getClient } from '../lib/pocketbase';

interface AuthContextType {
  user: RecordModel | null;
  pb: PocketBase;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pb = getClient();
  const [user, setUser] = useState<RecordModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The server (middleware + server-rendered pages) reads the token from the
    // pb_auth cookie, so keep it in lockstep with the SDK's auth store.
    const syncCookie = (token: string) => {
      document.cookie = token
        ? `pb_auth=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
        : 'pb_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    };

    // An expired token would look logged-in here while every request is
    // anonymous: drop it so the user is asked to sign in again.
    if (pb.authStore.token && !pb.authStore.isValid) pb.authStore.clear();

    setUser(pb.authStore.record);
    syncCookie(pb.authStore.token);
    setLoading(false);

    const unsubscribe = pb.authStore.onChange((token, record) => {
      setUser(record);
      syncCookie(token);
    });

    // Renew a still-valid token once per visit so active users stay signed in.
    // Some tokens (OAuth, impersonation) can't be refreshed; those just keep
    // working until they expire.
    if (pb.authStore.isValid) {
      pb.collection('users').authRefresh({ requestKey: 'auth-refresh' }).catch(() => {});
    }

    return () => unsubscribe();
  }, [pb]);

  const signOut = useCallback(() => {
    pb.authStore.clear();
    // Clear the pb_auth cookie so middleware redirects to login
    document.cookie = 'pb_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/auth/login';
  }, [pb]);

  return (
    <AuthContext.Provider value={{ user, pb, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
