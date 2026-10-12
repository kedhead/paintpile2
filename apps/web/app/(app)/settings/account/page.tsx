'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '../../../../components/auth-provider';

export default function AccountSettingsPage() {
  const { user, pb } = useAuth();
  const router = useRouter();
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pbToken: pb.authStore.token }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');

      pb.authStore.clear();
      router.push('/auth/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Account</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      {/* Export Data */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Export Data</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Download a copy of all your Paintpile data including projects, recipes, posts, and more.
        </p>
        <button
          onClick={async () => {
            const res = await fetch('/api/user/export-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pbToken: pb.authStore.token }),
            });
            if (res.ok) {
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `paintpile-export-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }
          }}
          className="mt-4 rounded-md bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80"
        >
          Download My Data
        </button>
      </div>

      {/* Delete Account */}
      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <h2 className="text-lg font-semibold text-red-400">Delete Account</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Permanently delete your account and all associated data. This includes all projects,
          photos, recipes, posts, comments, and AI history. This action cannot be undone.
        </p>

        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}

        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Type <span className="font-mono font-bold text-foreground">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-red-400 focus:outline-none"
            />
          </div>
          <button
            onClick={handleDelete}
            disabled={confirmText !== 'DELETE' || loading}
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}
