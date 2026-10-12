'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../../components/auth-provider';
import { CURATED_RECIPES } from '../../../../lib/seed-recipe-data';

const CATEGORIES = [
  { value: 'skin-tone', label: 'Skin Tone' },
  { value: 'metallic', label: 'Metallic' },
  { value: 'fabric', label: 'Fabric/Cloth' },
  { value: 'leather', label: 'Leather' },
  { value: 'armor', label: 'Armor' },
  { value: 'weapon', label: 'Weapon' },
  { value: 'wood', label: 'Wood' },
  { value: 'stone', label: 'Stone' },
  { value: 'nmm', label: 'Non-Metallic Metal' },
  { value: 'osl', label: 'Object Source Lighting' },
  { value: 'weathering', label: 'Weathering' },
  { value: 'glow-effect', label: 'Glow Effect' },
  { value: 'gem', label: 'Gem/Crystal' },
  { value: 'base-terrain', label: 'Base/Terrain' },
  { value: 'other', label: 'Other' },
];

const DIFFICULTIES = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export default function SeedRecipesPage() {
  const { pb } = useAuth();
  const [recipeCount, setRecipeCount] = useState<number | null>(null);
  const [curatedStatus, setCuratedStatus] = useState('');
  const [curatedWorking, setCuratedWorking] = useState(false);
  const [aiCategory, setAiCategory] = useState('armor');
  const [aiDifficulty, setAiDifficulty] = useState('beginner');
  const [aiCount, setAiCount] = useState(2);
  const [aiStatus, setAiStatus] = useState('');
  const [aiWorking, setAiWorking] = useState(false);

  async function fetchCount() {
    try {
      const res = await fetch(`/api/admin/seed-recipes?pbToken=${encodeURIComponent(pb.authStore.token)}`);
      const data = await res.json();
      if (data.success) setRecipeCount(data.total);
    } catch {
      // non-critical
    }
  }

  useEffect(() => {
    fetchCount();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function seedCurated() {
    setCuratedWorking(true);
    setCuratedStatus('Seeding curated recipes...');
    try {
      const res = await fetch('/api/admin/seed-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pbToken: pb.authStore.token, type: 'curated' }),
      });
      const data = await res.json();
      if (data.success) {
        const parts = [`Created ${data.created} recipe(s)`];
        if (data.skipped > 0) parts.push(`${data.skipped} already existed`);
        if (data.errors?.length > 0) parts.push(`${data.errors.length} error(s): ${data.errors[0]}`);
        setCuratedStatus(parts.join(' · '));
        fetchCount();
      } else {
        setCuratedStatus(`Error: ${data.error}`);
      }
    } catch {
      setCuratedStatus('Network error — check console');
    }
    setCuratedWorking(false);
  }

  async function generateAI() {
    setAiWorking(true);
    setAiStatus(`Generating ${aiCount} recipe(s) with AI…`);
    try {
      const res = await fetch('/api/admin/seed-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pbToken: pb.authStore.token,
          type: 'ai',
          category: aiCategory,
          difficulty: aiDifficulty,
          count: aiCount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const parts = [`Created ${data.created} recipe(s)`];
        if (data.errors?.length > 0) parts.push(`${data.errors.length} error(s): ${data.errors[0]}`);
        setAiStatus(parts.join(' · '));
        fetchCount();
      } else {
        setAiStatus(`Error: ${data.error}`);
      }
    } catch {
      setAiStatus('Network error — check console');
    }
    setAiWorking(false);
  }

  const selectClass = 'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary';

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Seed Recipes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Populate the public recipe library with curated and AI-generated painting guides
          </p>
        </div>
      </div>

      {recipeCount !== null && (
        <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          Public recipes in database: <span className="font-semibold text-foreground">{recipeCount}</span>
        </div>
      )}

      {/* Curated Recipes */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h2 className="font-semibold text-foreground">Curated Recipes</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Seed {CURATED_RECIPES.length} hand-crafted recipes covering beginner to advanced techniques across all major categories. Already-existing recipes are skipped.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          {CURATED_RECIPES.map((r) => (
            <div key={r.name} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span>{r.name}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={seedCurated}
            disabled={curatedWorking}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
          >
            {curatedWorking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <BookOpen className="w-4 h-4" />
            )}
            Seed {CURATED_RECIPES.length} Curated Recipes
          </button>
        </div>

        {curatedStatus && (
          <div className={`flex items-start gap-2 text-sm rounded-md px-3 py-2 ${curatedStatus.startsWith('Error') ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
            {curatedStatus.startsWith('Error') ? (
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            )}
            {curatedStatus}
          </div>
        )}
      </div>

      {/* AI Generation */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h2 className="font-semibold text-foreground">AI-Generated Recipes</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Use Claude to generate additional recipes for a specific category and difficulty. Each request uses Anthropic API credits.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</label>
            <select
              value={aiCategory}
              onChange={(e) => setAiCategory(e.target.value)}
              className={selectClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Difficulty</label>
            <select
              value={aiDifficulty}
              onChange={(e) => setAiDifficulty(e.target.value)}
              className={selectClass}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Count (1–5)</label>
            <input
              type="number"
              min={1}
              max={5}
              value={aiCount}
              onChange={(e) => setAiCount(Math.min(5, Math.max(1, Number(e.target.value))))}
              className={selectClass}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={generateAI}
            disabled={aiWorking}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
          >
            {aiWorking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Generate with AI
          </button>
          <span className="text-xs text-muted-foreground">May take 15–30 seconds</span>
        </div>

        {aiStatus && (
          <div className={`flex items-start gap-2 text-sm rounded-md px-3 py-2 ${aiStatus.startsWith('Error') ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
            {aiStatus.startsWith('Error') ? (
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            )}
            {aiStatus}
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        Seeded recipes are public and attributed to your admin account. Visit{' '}
        <Link href="/recipes" className="underline hover:text-foreground">
          /recipes
        </Link>{' '}
        to see them in the Browse tab.
      </div>
    </div>
  );
}
