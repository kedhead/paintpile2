'use client';

import { useState } from 'react';
import type { RecordModel } from 'pocketbase';
import { Plus, X, Loader2, Hash, Pencil, Check } from 'lucide-react';
import { useMyProjects } from '../../hooks/use-projects';
import { useAddArmyMember, useRemoveArmyMember } from '../../hooks/use-armies';
import { useAuth } from '../auth-provider';
import PocketBase from 'pocketbase';

interface ArmyMemberManagerProps {
  armyId: string;
  members: RecordModel[];
}

export function ArmyMemberManager({ armyId, members }: ArmyMemberManagerProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [unitCount, setUnitCount] = useState(1);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingCount, setEditingCount] = useState(1);
  const [savingId, setSavingId] = useState<string | null>(null);
  const myProjects = useMyProjects();
  const addMember = useAddArmyMember();
  const removeMember = useRemoveArmyMember();
  const { pb } = useAuth();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allProjects = (myProjects.data as any)?.pages?.flatMap((p: any) => p.items) || [];
  const memberProjectIds = new Set(members.map((m) => m.project));
  const availableProjects = allProjects.filter(
    (p: RecordModel) => !memberProjectIds.has(p.id)
  );

  const handleAdd = async (projectId: string) => {
    await addMember.mutateAsync({ armyId, projectId, unitCount });
    setShowAdd(false);
    setUnitCount(1);
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('Remove this project from the army?')) return;
    await removeMember.mutateAsync({ memberId, armyId });
  };

  const handleEditCount = async (memberId: string) => {
    setSavingId(memberId);
    try {
      await (pb as PocketBase).collection('army_members').update(memberId, { unit_count: editingCount });
      setEditingMemberId(null);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-2">
      {/* Current Members */}
      {members.map((member: RecordModel) => {
        const project = member.expand?.project;
        if (!project) return null;
        const count = member.unit_count ?? 1;

        return (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 gap-2"
          >
            <span className="text-sm text-foreground line-clamp-1 flex-1">{project.name}</span>

            {/* Unit count */}
            {editingMemberId === member.id ? (
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min={1}
                  value={editingCount}
                  onChange={(e) => setEditingCount(Math.max(1, Number(e.target.value)))}
                  className="w-14 rounded border border-border bg-background px-2 py-0.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
                <button
                  onClick={() => handleEditCount(member.id)}
                  disabled={savingId === member.id}
                  className="rounded p-1 text-green-500 hover:bg-muted"
                >
                  {savingId === member.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                </button>
                <button onClick={() => setEditingMemberId(null)} className="rounded p-1 text-muted-foreground hover:bg-muted">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setEditingMemberId(member.id); setEditingCount(count); }}
                className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground shrink-0"
                title="Edit unit count"
              >
                <Hash className="h-3 w-3" />
                {count}
                <Pencil className="h-3 w-3 ml-0.5" />
              </button>
            )}

            <button
              onClick={() => handleRemove(member.id)}
              disabled={removeMember.isPending}
              className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-red-400"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}

      {/* Add button / selector */}
      {showAdd ? (
        <div className="rounded-lg border border-border bg-card p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Add a project</span>
            <button
              onClick={() => { setShowAdd(false); setUnitCount(1); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {myProjects.isLoading ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : availableProjects.length === 0 ? (
            <p className="text-xs text-muted-foreground">No available projects to add.</p>
          ) : (
            <>
              <select
                onChange={(e) => {
                  if (e.target.value) handleAdd(e.target.value);
                }}
                disabled={addMember.isPending}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                defaultValue=""
              >
                <option value="" disabled>
                  Select a project...
                </option>
                {availableProjects.map((p: RecordModel) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground whitespace-nowrap">Unit count:</label>
                <input
                  type="number"
                  min={1}
                  value={unitCount}
                  onChange={(e) => setUnitCount(Math.max(1, Number(e.target.value)))}
                  className="w-20 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </>
          )}
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Project
        </button>
      )}
    </div>
  );
}
