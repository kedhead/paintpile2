'use client';

import { useState } from 'react';
import type { RecordModel } from 'pocketbase';
import {
  Trophy,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  ChevronRight,
  Award,
  Megaphone,
  Crown,
  ThumbsUp,
  ImageIcon,
} from 'lucide-react';
import { getDisplayName } from '@paintpile/shared';
import { useAuth } from '../../../../components/auth-provider';
import { useChallenges, useChallengeEntries } from '../../../../hooks/use-challenges';
import { useAllBadges } from '../../../../hooks/use-badges';
import { useProjectPhotos } from '../../../../hooks/use-photos';
import { getFileUrl, getAvatarUrl, relativeTime } from '../../../../lib/pb-helpers';
import { BadgeCard } from '../../../../components/badges/badge-card';

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

function EntryPhoto({ projectId }: { projectId: string }) {
  const { data: photos = [] } = useProjectPhotos(projectId);
  const photo = photos[0];
  if (!photo?.image) return <ImageIcon className="h-6 w-6 text-muted-foreground/50" />;
  return <img src={getFileUrl(photo, photo.image, '100x100')} alt="" className="h-full w-full object-cover" />;
}

function ChallengeEntries({
  challenge,
  onPickWinner,
}: {
  challenge: RecordModel;
  onPickWinner: (entryId: string) => void;
}) {
  const { data: entries = [], isLoading } = useChallengeEntries(challenge.id);

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mx-auto my-4" />;
  }

  if (entries.length === 0) {
    return <p className="text-xs text-muted-foreground py-4 text-center">No entries yet</p>;
  }

  const sorted = [...entries].sort((a, b) => (b.votes || 0) - (a.votes || 0));

  return (
    <div className="space-y-1.5">
      {sorted.map((entry, i) => {
        const entryUser = entry.expand?.user;
        const isWinner = challenge.winner === entry.id;
        return (
          <div
            key={entry.id}
            className={`flex items-center gap-3 rounded-lg border p-2 ${
              isWinner ? 'border-amber-500/50 bg-amber-500/10' : 'border-border bg-muted/30'
            }`}
          >
            <span className="w-5 text-center text-xs font-bold text-muted-foreground">
              {i + 1}
            </span>
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-muted flex items-center justify-center">
              {entry.photo_url ? (
                <img src={entry.photo_url} alt="" className="h-full w-full object-cover" />
              ) : entry.project ? (
                <EntryPhoto projectId={entry.project} />
              ) : (
                <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {isWinner && <Crown className="inline h-3 w-3 text-amber-400 mr-1" />}
                {entry.project_title}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {entryUser ? getDisplayName(entryUser) : 'Unknown'} · {relativeTime(entry.created)}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ThumbsUp className="h-3 w-3" />
                {entry.votes || 0}
              </span>
              {!isWinner && (
                <button
                  onClick={() => onPickWinner(entry.id)}
                  className="rounded px-2 py-1 text-[10px] font-medium text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
                >
                  Pick Winner
                </button>
              )}
              {isWinner && (
                <span className="rounded bg-amber-500/20 px-2 py-1 text-[10px] font-bold text-amber-400">
                  Winner
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminChallengesPage() {
  const { pb, user } = useAuth();
  const { data: challenges = [], refetch } = useChallenges();
  const { data: allBadges = [] } = useAllBadges();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ChallengeFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Award modal state
  const [awardingId, setAwardingId] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [awardSaving, setAwardSaving] = useState(false);

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

  const handlePickWinner = async (challengeId: string, entryId: string) => {
    await pb.collection('challenges').update(challengeId, { winner: entryId });
    refetch();
  };

  const openAwardModal = (challengeId: string) => {
    const challenge = challenges.find((c) => c.id === challengeId);
    setAwardingId(challengeId);
    setSelectedBadge(challenge?.winner_badge || '');
    setAnnouncement(challenge?.announcement || '');
  };

  const handleAward = async () => {
    if (!awardingId) return;
    setAwardSaving(true);
    try {
      const challenge = challenges.find((c) => c.id === awardingId);
      if (!challenge?.winner) {
        alert('Pick a winner first');
        return;
      }

      // Update challenge with badge and announcement
      await pb.collection('challenges').update(awardingId, {
        winner_badge: selectedBadge || null,
        announcement: announcement.trim() || null,
        status: 'completed',
      });

      // Award badge to winner's user if a badge was selected
      if (selectedBadge) {
        // Get the winning entry to find the user
        const winnerEntry = await pb.collection('challenge_entries').getOne(challenge.winner);
        // Check if user already has this badge
        const existing = await pb.collection('user_badges').getFullList({
          filter: `user="${winnerEntry.user}" && badge="${selectedBadge}"`,
        });
        if (existing.length === 0) {
          await pb.collection('user_badges').create({
            user: winnerEntry.user,
            badge: selectedBadge,
          });
        }
      }

      // Post news announcement if provided
      if (announcement.trim()) {
        await pb.collection('news').create({
          title: `Challenge Winner: ${challenge.title}`,
          content: announcement.trim(),
          type: 'challenge',
          author: user!.id,
        });
      }

      setAwardingId(null);
      refetch();
    } catch (error) {
      console.error('Award error:', error);
      alert('Failed to award: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setAwardSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
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

      {/* Create / Edit form */}
      {showForm && (
        <form onSubmit={handleSave} className="space-y-3 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              {editingId ? 'Edit Challenge' : 'New Challenge'}
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-foreground"
            >
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
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as ChallengeFormData['type'] })
              }
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
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingId ? (
                'Update'
              ) : (
                'Create'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Award modal */}
      {awardingId && (
        <div className="rounded-lg border border-amber-500/30 bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" />
              Award & Announce
            </h3>
            <button
              onClick={() => setAwardingId(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Badge to award winner
            </label>
            <select
              value={selectedBadge}
              onChange={(e) => setSelectedBadge(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">No badge</option>
              {allBadges.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.tier})
                </option>
              ))}
            </select>
            {selectedBadge && (
              <div className="mt-2">
                <BadgeCard
                  badge={allBadges.find((b) => b.id === selectedBadge)!}
                  earned
                />
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Announcement (posted to news feed)
            </label>
            <textarea
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="Congratulations to our winner! Their entry stood out because..."
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setAwardingId(null)}
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleAward}
              disabled={awardSaving}
              className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {awardSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Megaphone className="h-4 w-4" />
                  Award & Complete
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Challenge list */}
      <div className="space-y-2">
        {challenges.map((c) => {
          const isExpanded = expandedId === c.id;
          return (
            <div key={c.id} className="rounded-lg border border-border bg-card overflow-hidden">
              {/* Challenge header row */}
              <div className="flex items-center gap-2 p-3">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    {c.winner && <Crown className="inline h-3 w-3 text-amber-400 mr-1" />}
                    {c.title}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.type} · {c.participant_count || 0} entries
                    {c.winner && ' · Winner selected'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select
                    value={c.status}
                    onChange={(e) => handleStatusChange(c.id, e.target.value)}
                    className={`rounded border px-2 py-1 text-xs ${
                      c.status === 'active'
                        ? 'border-green-500/30 bg-green-500/10 text-green-400'
                        : c.status === 'voting'
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                          : c.status === 'completed'
                            ? 'border-border bg-muted text-muted-foreground'
                            : 'border-border bg-background text-foreground'
                    }`}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="voting">Voting</option>
                    <option value="completed">Completed</option>
                  </select>
                  {c.winner && (
                    <button
                      onClick={() => openAwardModal(c.id)}
                      className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
                    >
                      <Award className="h-3 w-3" />
                      Award
                    </button>
                  )}
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
                    {deleting === c.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded entries */}
              {isExpanded && (
                <div className="border-t border-border px-3 py-3">
                  <ChallengeEntries
                    challenge={c}
                    onPickWinner={(entryId) => handlePickWinner(c.id, entryId)}
                  />
                </div>
              )}
            </div>
          );
        })}
        {challenges.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No challenges yet</p>
        )}
      </div>
    </div>
  );
}
