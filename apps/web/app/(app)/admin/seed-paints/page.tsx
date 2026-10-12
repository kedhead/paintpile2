'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Palette, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../../../components/auth-provider';

export default function SeedPaintsPage() {
  const { pb } = useAuth();
  const [brandCounts, setBrandCounts] = useState<Record<string, number> | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [status, setStatus] = useState('');
  const [working, setWorking] = useState(false);

  async function viewCount() {
    setWorking(true);
    setStatus('Fetching paint counts...');
    try {
      const res = await fetch(`/api/admin/seed-paints?pbToken=${encodeURIComponent(pb.authStore.token)}`);
      const data = await res.json();
      if (data.success) {
        setBrandCounts(data.brands);
        setTotalCount(data.total);
        setStatus(`Found ${data.total} paints across ${Object.keys(data.brands).length} brands`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch {
      setStatus('Failed to fetch paint counts');
    }
    setWorking(false);
  }

  async function clearPaints() {
    if (!confirm('This will delete ALL non-custom paints. Are you sure?')) return;
    setWorking(true);
    setStatus('Clearing non-custom paints...');
    try {
      const res = await fetch('/api/admin/clear-paints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pbToken: pb.authStore.token }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(`Cleared ${data.deleted} paints (${data.failed} failed)`);
        setBrandCounts(null);
        setTotalCount(null);
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
        <h1 className="text-2xl font-bold text-foreground">Seed Paints</h1>
      </div>

      <div className="flex gap-3">
        <button
          onClick={viewCount}
          disabled={working}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
        >
          {working ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
          View Paint Count
        </button>
        <button
          onClick={clearPaints}
          disabled={working}
          className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 disabled:opacity-50 flex items-center gap-2"
        >
          Clear Non-Custom Paints
        </button>
      </div>

      {status && (
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-foreground">{status}</p>
        </div>
      )}

      {brandCounts && Object.keys(brandCounts).length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Paint Count by Brand</h3>
          <div className="space-y-1">
            {Object.entries(brandCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([brand, count]) => (
                <div key={brand} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{brand}</span>
                  <span className="text-foreground font-mono">{count}</span>
                </div>
              ))}
            <div className="border-t border-border pt-1 mt-2 flex justify-between text-sm font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-primary font-mono">{totalCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
