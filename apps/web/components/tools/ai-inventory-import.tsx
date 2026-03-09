'use client';

import { useState } from 'react';
import { Upload, Loader2, Check, X } from 'lucide-react';

interface MatchResult {
  input: string;
  paintId: string | null;
  name: string;
  brand: string;
  confidence: number;
}

export function AIInventoryImport() {
  const [text, setText] = useState('');
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/inventory-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });
      if (!res.ok) throw new Error('Failed to analyze');
      const data = await res.json();
      setMatches(data.matches || []);
      // Auto-select high-confidence matches
      const autoSelected = new Set<string>();
      data.matches?.forEach((m: MatchResult) => {
        if (m.paintId && m.confidence >= 0.8) autoSelected.add(m.paintId);
      });
      setSelected(autoSelected);
    } catch {
      setError('Failed to analyze text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (paintId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(paintId)) next.delete(paintId);
      else next.add(paintId);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Paste your paint collection description
        </label>
        <textarea
          placeholder="E.g., 'I have Citadel Abaddon Black, Mephiston Red, Leadbelcher, Army Painter Matt White, Vallejo Game Color Gold...'"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || !text.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Analyze & Match
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {matches.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            Found {matches.length} matches ({selected.size} selected)
          </h3>
          <div className="max-h-80 space-y-1 overflow-y-auto">
            {matches.map((match, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${
                  match.paintId
                    ? selected.has(match.paintId)
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card'
                    : 'border-border bg-card opacity-50'
                }`}
              >
                {match.paintId ? (
                  <button
                    onClick={() => toggleSelect(match.paintId!)}
                    className={`flex h-5 w-5 items-center justify-center rounded border ${
                      selected.has(match.paintId)
                        ? 'border-primary bg-primary text-white'
                        : 'border-border'
                    }`}
                  >
                    {selected.has(match.paintId) && <Check className="h-3 w-3" />}
                  </button>
                ) : (
                  <X className="h-4 w-4 text-red-400" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">
                    <span className="text-muted-foreground">&quot;{match.input}&quot;</span>
                    {match.paintId && (
                      <>
                        {' → '}
                        <span className="font-medium">{match.name}</span>
                        <span className="text-muted-foreground"> ({match.brand})</span>
                      </>
                    )}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {match.paintId ? `${Math.round(match.confidence * 100)}%` : 'No match'}
                </span>
              </div>
            ))}
          </div>
          {selected.size > 0 && (
            <button
              disabled={importing}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
            >
              {importing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </span>
              ) : (
                `Add ${selected.size} paints to inventory`
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
