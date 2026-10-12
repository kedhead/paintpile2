'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../../../components/auth-provider';

export default function ClearPaintsPage() {
  const { pb } = useAuth();
  const [working, setWorking] = useState(false);
  const [status, setStatus] = useState('');

  async function clearPaints() {
    if (!confirm('This will permanently delete ALL non-custom paints from the database. This action cannot be undone. Continue?')) return;
    setWorking(true);
    setStatus('Deleting non-custom paints...');
    try {
      const res = await fetch('/api/admin/clear-paints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pbToken: pb.authStore.token }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(`Successfully deleted ${data.deleted} paints. ${data.failed > 0 ? `${data.failed} failed to delete.` : ''}`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch {
      setStatus('Failed to clear paints');
    }
    setWorking(false);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Clear Paint Database</h1>
      </div>

      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
        <p className="text-sm text-foreground">
          This will delete all non-custom paints from the database. Custom paints created by users will not be affected. This action cannot be undone.
        </p>
      </div>

      <button
        onClick={clearPaints}
        disabled={working}
        className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 disabled:opacity-50 flex items-center gap-2"
      >
        {working ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        Clear All Non-Custom Paints
      </button>

      {status && (
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-foreground">{status}</p>
        </div>
      )}
    </div>
  );
}
