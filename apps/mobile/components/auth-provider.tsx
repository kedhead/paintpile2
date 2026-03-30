import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import PocketBase, { type RecordModel } from 'pocketbase';
import { router } from 'expo-router';
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
    // AsyncAuthStore initialises from SecureStore asynchronously,
    // so we wait for it to be ready before reading the record.
    const init = async () => {
      // The store's initial promise resolves when SecureStore has loaded.
      // Access authStore.record after the promise settles.
      await (pb.authStore as unknown as { _initial: Promise<unknown> })._initial?.catch(() => {});
      setUser(pb.authStore.record);
      setLoading(false);
    };
    init();

    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(record);
    });

    return () => unsubscribe();
  }, [pb]);

  const signOut = useCallback(() => {
    pb.authStore.clear();
    router.replace('/auth/login');
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
