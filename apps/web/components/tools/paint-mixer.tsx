'use client';

import { useState } from 'react';
import { Palette, Loader2, Send } from 'lucide-react';
import { useAuth } from '../auth-provider';

export function PaintMixer() {
  const { pb } = useAuth();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/paint-mixer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), pbToken: pb.authStore.token }),
      });
      if (!res.ok) throw new Error('Failed to get mixing recipe');
      const data = await res.json();
      setResult(data.recipe);
    } catch (err) {
      setError('Failed to generate mixing recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Describe the color you want to mix (e.g., 'rusty orange-brown for Space Marine armor')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Mix
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Mixing Recipe</h3>
          </div>
          <div className="whitespace-pre-wrap text-sm text-foreground">{result}</div>
        </div>
      )}
    </div>
  );
}
