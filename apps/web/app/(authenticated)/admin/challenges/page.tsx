'use client';

import { useState } from 'react';
import { Trophy, Plus, Loader2, Pencil, Trash2, X } from 'lucide-react';
import { useAuth } from '../../../../components/auth-provider';
import { useChallenges } from '../../../../hooks/use-challenges';

interface ChallengeFormData {
  title: string;
  description: string;
  type: 'painting' | 'kitbash' | 'community';
  endDate: string;
}

const EMPTY_FORM: ChallengeFormData = {
  title: '',
  description: '',
  type: 'painting',
  endDate: '',
};

export default function AdminChallengesPage() {
  const { pb } = useAuth();
  const { data: challenges = [], refetch } = useChallenges();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ChallengeFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (challenge: Record<string, unknown>) => {
    setEditingId(challenge.id as string);
    setForm({
      title: (challenge.title as string) || '',
      description: (challenge.description as string) || '',
      type: (challenge.type as ChallengeFormData['type']) || 'painting',
      endDate: challenge.end_date ? (challenge.end_date as string).split('T')[0] : '',
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        end_date: form.endDate || undefined,
      };
      if (editingId) {
        await pb.collection('challenges').update(editingId, payload);
      } else {
        await pb.collection('challenges').create({
          ...payload,
          status: 'active',
          start_date: new Date().toISOString(),
          participant_count: 0,
        });
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      refetch();
    } catch (error) {
      console.error('Save challenge error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await pb.collection('challenges').update(id, { status });
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this challenge? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await pb.collection('challenges').delete(id);
      refetch();
    } catch (error) {
      console.error('Delete challenge error:', error);
      alert('Failed to delete challenge');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Manage Challenges</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/80"
        >
          <Plus className="h-4 w-4" />
          New Challenge
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="space-y-3 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">{editingId ? 'Edit Challenge' : 'New Challenge'}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Challenge title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            required
          />
          <textarea
            placeholder="Description..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            required
          />
          <div className="flex gap-3">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as ChallengeFormData['type'] })}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="painting">Painting</option>
              <option value="kitbash">Kitbash</option>
              <option value="community">Community</option>
            </select>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="End date"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {challenges.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
              <p className="text-xs text-muted-foreground truncate">{c.description}</p>
              <p className="text-xs text-muted-foreground">{c.type} &middot; {c.participant_count || 0} entries</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              <select
                value={c.status}
                onChange={(e) => handleStatusChange(c.id, e.target.value)}
                className="rounded border border-border bg-background px-2 py-1 text-xs"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="voting">Voting</option>
                <option value="completed">Completed</option>
              </select>
              <button
                onClick={() => openEdit(c)}
                className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                disabled={deleting === c.id}
                className="rounded p-1.5 text-muted-foreground hover:bg-red-900/30 hover:text-red-400"
              >
                {deleting === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        ))}
        {challenges.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No challenges yet</p>
        )}
      </div>
    </div>
  );
}
