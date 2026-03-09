'use client';

import { useEffect, useState } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { useAuth } from '../../../components/auth-provider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pb, user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        const record = await pb.collection('users').getOne(user!.id);
        setIsAdmin(record.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
      setLoading(false);
    }
    if (user) check();
  }, [user, pb]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-16">
        <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground mt-2">You do not have admin privileges.</p>
      </div>
    );
  }

  return <>{children}</>;
}
