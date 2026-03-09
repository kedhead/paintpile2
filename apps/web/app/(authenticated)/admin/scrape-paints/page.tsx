'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Globe, ArrowLeft, Loader2, Check, ChevronDown, ChevronRight, Database } from 'lucide-react';
import { useAuth } from '../../../../components/auth-provider';

interface ScrapedSet {
  setName: string;
  brand: string;
  paintCount: number;
  paintNames: string[];
  sourceUrl: string;
  description?: string;
}

interface ScrapeResult {
  brand: string;
  sets: ScrapedSet[];
  scrapedAt: string;
  errors: string[];
}

const BRANDS = [
  { id: 'Citadel (Games Workshop)', name: 'Citadel (Games Workshop)' },
  { id: 'The Army Painter', name: 'The Army Painter' },
  { id: 'Vallejo', name: 'Vallejo' },
  { id: 'Monument Hobbies', name: 'Monument Hobbies (ProAcryl)' },
  { id: 'Scale75', name: 'Scale75' },
  { id: 'Reaper', name: 'Reaper Miniatures' },
  { id: 'AK Interactive', name: 'AK Interactive' },
];

export default function ScrapePaintsPage() {
  const { pb } = useAuth();
  const [selected, setSelected] = useState<Set<string>>(new Set(['Citadel (Games Workshop)', 'The Army Painter', 'Vallejo']));
  const [scraping, setScraping] = useState(false);
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState('');
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());

  function toggleBrand(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleExpanded(brand: string) {
    setExpandedBrands(prev => {
      const next = new Set(prev);
      if (next.has(brand)) next.delete(brand);
      else next.add(brand);
      return next;
    });
  }

  async function handleScrape() {
    if (selected.size === 0) return;
    setScraping(true);
    setError('');
    setResults([]);
    setSaveResult('');

    try {
      const res = await fetch('/api/admin/scrape-paints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pbToken: pb.authStore.token,
          brands: Array.from(selected),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
      } else {
        setError(data.error || 'Scraping failed');
      }
    } catch {
      setError('Failed to scrape');
    }
    setScraping(false);
  }

  async function handleSaveToDatabase() {
    if (results.length === 0) return;
    setSaving(true);
    setSaveResult('');
    setError('');

    try {
      const setsToSave: unknown[] = [];
      for (const r of results) {
        for (const set of r.sets) {
          setsToSave.push({
            setName: set.setName,
            brand: set.brand,
            paintCount: set.paintCount,
            paintNames: set.paintNames,
            description: set.description || '',
            sourceUrl: set.sourceUrl || '',
          });
        }
      }

      const res = await fetch('/api/admin/save-paint-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pbToken: pb.authStore.token,
          sets: setsToSave,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveResult(`Saved ${data.created} sets (${data.failed} failed)`);
      } else {
        setError(data.error || 'Save failed');
      }
    } catch {
      setError('Failed to save');
    }
    setSaving(false);
  }

  const totalSets = results.reduce((sum, r) => sum + r.sets.length, 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Scrape Paint Sets</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Use AI to discover paint sets from manufacturer catalogs. Select brands and click scrape to find official paint sets and their contents.
      </p>

      {/* Brand Selection */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-semibold text-foreground mb-2">Select Brands</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {BRANDS.map(brand => (
            <button
              key={brand.id}
              onClick={() => toggleBrand(brand.id)}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                selected.has(brand.id)
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  selected.has(brand.id)
                    ? 'bg-primary border-primary'
                    : 'border-border bg-muted'
                }`}
              >
                {selected.has(brand.id) && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
              <span className="text-sm text-foreground">{brand.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrape Button */}
      <button
        onClick={handleScrape}
        disabled={scraping || selected.size === 0}
        className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
      >
        {scraping ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Scraping... (This may take 2-5 minutes)
          </>
        ) : (
          <>
            <Globe className="w-4 h-4" />
            Start Scraping ({selected.size} brands)
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Save Success */}
      {saveResult && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm">
          {saveResult}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">
              Results: {totalSets} sets found
            </h2>
            <button
              onClick={handleSaveToDatabase}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              Save to Database
            </button>
          </div>

          {results.map((result, idx) => (
            <div key={idx} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-foreground">{result.brand}</h3>
                  <p className="text-xs text-muted-foreground">
                    {result.sets.length} sets found &middot; {result.errors.length} errors
                  </p>
                </div>
                {result.sets.length > 0 && (
                  <Check className="w-5 h-5 text-green-400" />
                )}
              </div>

              {result.errors.length > 0 && (
                <div className="mb-3 p-2 bg-amber-500/10 rounded-lg">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-xs text-amber-400">&bull; {err}</p>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {result.sets.map((set, setIdx) => (
                  <div key={setIdx} className="p-3 bg-muted/30 rounded-lg border border-border">
                    <button
                      onClick={() => toggleExpanded(`${result.brand}-${setIdx}`)}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{set.setName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {set.paintCount} paints &middot; {set.paintNames.length} names extracted
                        </p>
                      </div>
                      {expandedBrands.has(`${result.brand}-${setIdx}`) ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    {expandedBrands.has(`${result.brand}-${setIdx}`) && set.paintNames.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border">
                        {set.description && (
                          <p className="text-xs text-muted-foreground mb-2">{set.description}</p>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {set.paintNames.map((name, i) => (
                            <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-400 mb-2">How It Works</h3>
        <ol className="text-xs text-blue-300/80 space-y-1 list-decimal list-inside">
          <li>Select brands to discover paint sets from</li>
          <li>AI will identify official paint sets and their contents (2-5 minutes)</li>
          <li>Review the results and expand sets to see included paints</li>
          <li>Click &quot;Save to Database&quot; to store the sets</li>
        </ol>
      </div>
    </div>
  );
}
