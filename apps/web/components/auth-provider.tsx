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
  const [user, setUser] = useState<RecordModel | null>(pb.authStore.record);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(pb.authStore.record);
    setLoading(false);

    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(record);
    });

    return () => unsubscribe();
  }, [pb]);

  const signOut = useCallback(() => {
    pb.authStore.clear();
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
