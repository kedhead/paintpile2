'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Database, ArrowLeft, Loader2, Check } from 'lucide-react';
import { useAuth } from '../../../../components/auth-provider';

const MANUFACTURERS = [
  'Citadel',
  'Vallejo Game Color',
  'Vallejo Model Color',
  'Army Painter',
  'Scale75',
  'P3',
  'Reaper',
  'AK Interactive',
  'Kimera',
  'Monument',
  'ProAcryl',
];

export default function ImportGitHubPaintsPage() {
  const { pb } = useAuth();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<Record<string, { created: number; failed: number; error?: string }> | null>(null);
  const [error, setError] = useState('');

  function toggleManufacturer(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === MANUFACTURERS.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(MANUFACTURERS));
    }
  }

  async function importSelected() {
    if (selected.size === 0) return;
    setImporting(true);
    setError('');
    setResults(null);
    try {
      const res = await fetch('/api/admin/import-github-paints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pbToken: pb.authStore.token,
          manufacturers: Array.from(selected),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
      } else {
        setError(data.error || 'Import failed');
      }
    } catch {
      setError('Failed to import');
    }
    setImporting(false);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Import from GitHub</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Import paint data from the miniature-paints GitHub repository. Select manufacturers to import.
      </p>

      <div className="bg-card border border-border rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground">Manufacturers</h3>
          <button
            onClick={selectAll}
            className="text-xs text-primary hover:text-primary/80"
          >
            {selected.size === MANUFACTURERS.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        {MANUFACTURERS.map((name) => (
          <label
            key={name}
            className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-muted cursor-pointer"
          >
            <div
              className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                selected.has(name)
                  ? 'bg-primary border-primary'
                  : 'border-border bg-muted'
              }`}
            >
              {selected.has(name) && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
            <span className="text-sm text-foreground">{name}</span>
          </label>
        ))}
      </div>

      <button
        onClick={importSelected}
        disabled={importing || selected.size === 0}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
      >
        {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
        Import Selected ({selected.size})
      </button>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 text-destructive text-sm">
          {error}
        </div>
      )}

      {results && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Import Results</h3>
          <div className="space-y-2">
            {Object.entries(results).map(([manufacturer, result]) => (
              <div key={manufacturer} className="flex justify-between items-center text-sm">
                <span className="text-foreground">{manufacturer}</span>
                <div className="flex items-center gap-3">
                  {result.error ? (
                    <span className="text-destructive">{result.error}</span>
                  ) : (
                    <>
                      <span className="text-primary">{result.created} created</span>
                      {result.failed > 0 && (
                        <span className="text-destructive">{result.failed} failed</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
