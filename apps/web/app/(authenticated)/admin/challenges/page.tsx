'use client';

import { useState } from 'react';
import { Trophy, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../../../../components/auth-provider';
import { useChallenges } from '../../../../hooks/use-challenges';

export default function AdminChallengesPage() {
  const { pb } = useAuth();
  const { data: challenges = [], refetch } = useChallenges();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'painting' | 'kitbash' | 'community'>('painting');
  const [endDate, setEndDate] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setCreating(true);
    try {
      await pb.collection('challenges').create({
        title: title.trim(),
        description: description.trim(),
        type,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: endDate || undefined,
        participant_count: 0,
      });
      setTitle('');
      setDescription('');
      setEndDate('');
      setShowForm(false);
      refetch();
    } catch (error) {
      console.error('Create challenge error:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await pb.collection('challenges').update(id, { status });
    refetch();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Manage Challenges</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/80"
        >
          <Plus className="h-4 w-4" />
          New Challenge
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="space-y-3 rounded-lg border border-border bg-card p-4">
          <input
            type="text"
            placeholder="Challenge title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            required
          />
          <textarea
            placeholder="Description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            required
          />
          <div className="flex gap-3">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="painting">Painting</option>
              <option value="kitbash">Kitbash</option>
              <option value="community">Community</option>
            </select>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="End date"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted">Cancel</button>
            <button type="submit" disabled={creating} className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {challenges.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
              <p className="text-xs text-muted-foreground">{c.type} &middot; {c.participant_count || 0} entries</p>
            </div>
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
          </div>
        ))}
      </div>
    </div>
  );
}
