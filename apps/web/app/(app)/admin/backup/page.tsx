'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../../../components/auth-provider';

export default function BackupPage() {
  const { pb } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState('');

  async function downloadBackup() {
    setDownloading(true);
    setStatus('Creating backup...');
    try {
      const res = await fetch(`/api/admin/backup?pbToken=${encodeURIComponent(pb.authStore.token)}`);
      if (!res.ok) {
        const data = await res.json();
        setStatus(`Error: ${data.error || 'Backup failed'}`);
        setDownloading(false);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paintpile-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus('Backup downloaded successfully');
    } catch {
      setStatus('Failed to download backup');
    }
    setDownloading(false);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">System Backup</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Export all key collections (users, projects, paints, armies, recipes, posts, likes, comments, follows, notifications) as a JSON file.
      </p>

      <button
        onClick={downloadBackup}
        disabled={downloading}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
      >
        {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        Download Backup
      </button>

      {status && (
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-foreground">{status}</p>
        </div>
      )}
    </div>
  );
}
