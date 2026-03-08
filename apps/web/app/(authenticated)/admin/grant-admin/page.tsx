'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../../../components/auth-provider';

export default function GrantAdminPage() {
  const { pb, user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [secret, setSecret] = useState('');
  const [userId, setUserId] = useState('');
  const [grant, setGrant] = useState(true);
  const [working, setWorking] = useState(false);
  const [status, setStatus] = useState('');

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

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!isAdmin) return <div className="text-center py-16"><Shield className="w-12 h-12 text-destructive mx-auto mb-4" /><h1 className="text-2xl font-bold text-foreground">Access Denied</h1></div>;

  async function submitGrant() {
    if (!secret || !userId) return;
    setWorking(true);
    setStatus('');
    try {
      const res = await fetch('/api/admin/grant-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, userId, grant }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(`Successfully ${grant ? 'granted' : 'revoked'} admin role for ${data.user.email} (${data.user.id})`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch {
      setStatus('Failed to update admin role');
    }
    setWorking(false);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Grant Admin</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Grant or revoke admin privileges. Requires the ADMIN_SETUP_SECRET environment variable.
      </p>

      <div className="space-y-4 bg-card border border-border rounded-lg p-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Admin Setup Secret</label>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Enter setup secret..."
            className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">User ID</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter PocketBase user ID..."
            className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Action</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={grant}
                onChange={() => setGrant(true)}
                className="accent-primary"
              />
              <span className="text-sm text-foreground">Grant Admin</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!grant}
                onChange={() => setGrant(false)}
                className="accent-primary"
              />
              <span className="text-sm text-foreground">Revoke Admin</span>
            </label>
          </div>
        </div>

        <button
          onClick={submitGrant}
          disabled={working || !secret || !userId}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
        >
          {working ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          {grant ? 'Grant Admin' : 'Revoke Admin'}
        </button>
      </div>

      {status && (
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-foreground">{status}</p>
        </div>
      )}
    </div>
  );
}
