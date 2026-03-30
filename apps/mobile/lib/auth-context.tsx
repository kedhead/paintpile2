import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { RecordModel } from 'pocketbase';
import { getClient } from './pocketbase';

interface AuthContextType {
  user: RecordModel | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, username: string) => Promise<void>;
  signOut: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
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
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
