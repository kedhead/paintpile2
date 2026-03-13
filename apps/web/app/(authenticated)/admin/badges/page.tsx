'use client';

import { useState } from 'react';
import { Award, Loader2, Upload, Plus, Pencil, Trash2, X, Sparkles, Wand2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../../components/auth-provider';
import { useAllBadges } from '../../../../hooks/use-badges';
import { BADGE_DEFINITIONS, type BadgeDefinition } from '../../../../lib/badge-definitions';
import { BadgeCard } from '../../../../components/badges/badge-card';

const CATEGORIES: BadgeDefinition['category'][] = ['projects', 'armies', 'recipes', 'social', 'community', 'engagement', 'time', 'special'];
const TIERS: BadgeDefinition['tier'][] = ['bronze', 'silver', 'gold', 'platinum', 'legendary'];

interface BadgeFormData {
  name: string;
  description: string;
  category: BadgeDefinition['category'];
  tier: BadgeDefinition['tier'];
  icon: string;
  color: string;
  points: number;
  hidden: boolean;
  trigger_type: string;
  trigger_field: string;
  trigger_value: number;
}

const EMPTY_FORM: BadgeFormData = {
  name: '',
  description: '',
  category: 'projects',
  tier: 'bronze',
  icon: 'award',
  color: '#CD7F32',
  points: 10,
  hidden: false,
  trigger_type: 'stat_milestone',
  trigger_field: 'project_count',
  trigger_value: 1,
};

function AIGenerateBadgeDialog({
  open,
  onOpenChange,
  onGenerated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (data: Partial<BadgeFormData> & { icon_prompt?: string }) => void;
}) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { pb } = useAuth();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/badge/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pb.authStore.token}`,
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to generate');
      onGenerated(data.badge);
      onOpenChange(false);
      setPrompt('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Achievement Generator
          </h2>
          <button onClick={() => onOpenChange(false)}><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Describe the achievement you want to create.</p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Master of contrast who uses 5 different gray paints in one recipe"
            className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none h-24"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Generate Badge Ideas
          </button>
        </div>
      </div>
    </div>
  );
}

function AIGenerateIconDialog({
  open,
  onOpenChange,
  initialPrompt,
  onIconGenerated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPrompt?: string;
  onIconGenerated: (url: string) => void;
}) {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [loading, setLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { pb } = useAuth();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setGeneratedUrl(null);
    try {
      const res = await fetch('/api/ai/badge/generate-icon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pb.authStore.token}`,
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to generate icon');
      setGeneratedUrl(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-xl border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Icon Generator
          </h2>
          <button onClick={() => onOpenChange(false)}><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4 text-center">
          {!generatedUrl ? (
            <>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the icon style..."
                className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none h-24 text-left"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate Icon
              </button>
            </>
          ) : (
            <>
              <div className="mx-auto h-32 w-32 rounded-xl border border-border overflow-hidden bg-black/10">
                <img src={generatedUrl} alt="Generated Icon" className="h-full w-full object-cover" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setGeneratedUrl(null)}
                  className="flex-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  Back
                </button>
                <button
                  onClick={() => { onIconGenerated(generatedUrl); onOpenChange(false); }}
                  className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-white"
                >
                  Use Icon
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminBadgesPage() {
  const { pb } = useAuth();
  const { data: allBadges = [], isLoading, refetch } = useAllBadges();
  const [seeding, setSeeding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BadgeFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [iconPrompt, setIconPrompt] = useState('');

  const handleSeedBadges = async () => {
    setSeeding(true);
    try {
      const existingNames = new Set(allBadges.map((b) => b.name));
      let created = 0;
      for (const def of BADGE_DEFINITIONS) {
        if (existingNames.has(def.name)) continue;
        await pb.collection('badges').create({
          name: def.name,
          description: def.description,
          category: def.category,
          tier: def.tier,
          icon: def.icon,
          color: def.color,
          points: def.points,
          hidden: def.hidden,
          trigger_type: def.trigger_type,
          trigger_field: def.trigger_field,
          trigger_value: def.trigger_value,
        });
        created++;
      }
      alert(`Seeded ${created} new badges`);
      refetch();
    } catch (error) {
      console.error('Seed error:', error);
      alert('Failed to seed badges');
    } finally {
      setSeeding(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (badge: Record<string, unknown>) => {
    setEditingId(badge.id as string);
    setForm({
      name: (badge.name as string) || '',
      description: (badge.description as string) || '',
      category: (badge.category as BadgeDefinition['category']) || 'projects',
      tier: (badge.tier as BadgeDefinition['tier']) || 'bronze',
      icon: (badge.icon as string) || 'award',
      color: (badge.color as string) || '#CD7F32',
      points: (badge.points as number) || 10,
      hidden: (badge.hidden as boolean) || false,
      trigger_type: (badge.trigger_type as string) || 'stat_milestone',
      trigger_field: (badge.trigger_field as string) || '',
      trigger_value: (badge.trigger_value as number) || 1,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await pb.collection('badges').update(editingId, form);
      } else {
        await pb.collection('badges').create(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      refetch();
    } catch (error) {
      console.error('Save badge error:', error);
      alert('Failed to save badge');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this badge? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await pb.collection('badges').delete(id);
      refetch();
    } catch (error) {
      console.error('Delete badge error:', error);
      alert('Failed to delete badge');
    } finally {
      setDeleting(null);
    }
  };

  const handleAIGenerated = (data: any) => {
    setForm({
      ...EMPTY_FORM,
      ...data,
    });
    setIconPrompt(data.icon_prompt || '');
    setShowForm(true);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Manage Badges</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-sm font-medium text-purple-400 hover:bg-purple-500/20"
          >
            <Sparkles className="h-4 w-4" />
            AI Generate
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/80"
          >
            <Plus className="h-4 w-4" />
            New Badge
          </button>
          <button
            onClick={handleSeedBadges}
            disabled={seeding}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
          >
            {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Seed ({BADGE_DEFINITIONS.length})
          </button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {allBadges.length} badges in database
      </p>

      {/* Create/Edit Form */}
      {showForm && (
        <form onSubmit={handleSave} className="space-y-3 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">{editingId ? 'Edit Badge' : 'New Badge'}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Badge name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              required
            />
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Icon (e.g. award, palette or URL)"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowIconModal(true)}
                className="absolute right-2 top-1.5 text-purple-500 hover:text-purple-400"
              >
                <Sparkles className="h-4 w-4" />
              </button>
            </div>
          </div>
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            required
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as BadgeDefinition['category'] })}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={form.tier}
              onChange={(e) => setForm({ ...form, tier: e.target.value as BadgeDefinition['tier'] })}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {TIERS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="h-[38px] w-full cursor-pointer rounded-lg border border-border bg-background px-1"
            />
            <input
              type="number"
              placeholder="Points"
              value={form.points}
              onChange={(e) => setForm({ ...form, points: parseInt(e.target.value) || 0 })}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Trigger type"
              value={form.trigger_type}
              onChange={(e) => setForm({ ...form, trigger_type: e.target.value })}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <input
              type="text"
              placeholder="Trigger field"
              value={form.trigger_field}
              onChange={(e) => setForm({ ...form, trigger_field: e.target.value })}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <input
              type="number"
              placeholder="Trigger value"
              value={form.trigger_value}
              onChange={(e) => setForm({ ...form, trigger_value: parseInt(e.target.value) || 0 })}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.hidden}
                onChange={(e) => setForm({ ...form, hidden: e.target.checked })}
                className="rounded border-border"
              />
              Hidden badge
            </label>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-2">
          {allBadges.map((badge) => (
            <div key={badge.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-3 min-w-0">
                <BadgeCard badge={badge} earned />
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">{badge.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{badge.description}</p>
                  <p className="text-xs text-muted-foreground">{badge.category} &middot; {badge.tier} &middot; {badge.points}pts</p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => openEdit(badge)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(badge.id)}
                  disabled={deleting === badge.id}
                  className="rounded p-1.5 text-muted-foreground hover:bg-red-900/30 hover:text-red-400"
                >
                  {deleting === badge.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AIGenerateBadgeDialog
        open={showAIModal}
        onOpenChange={setShowAIModal}
        onGenerated={handleAIGenerated}
      />

      <AIGenerateIconDialog
        open={showIconModal}
        onOpenChange={setShowIconModal}
        initialPrompt={iconPrompt}
        onIconGenerated={(url) => setForm({ ...form, icon: url })}
      />
    </div>
  );
}
