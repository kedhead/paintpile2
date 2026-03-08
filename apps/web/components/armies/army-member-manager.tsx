'use client';

import { useState } from 'react';
import type { RecordModel } from 'pocketbase';
import { Plus, X, Loader2 } from 'lucide-react';
import { useMyProjects } from '../../hooks/use-projects';
import { useAddArmyMember, useRemoveArmyMember } from '../../hooks/use-armies';

interface ArmyMemberManagerProps {
  armyId: string;
  members: RecordModel[];
}

export function ArmyMemberManager({ armyId, members }: ArmyMemberManagerProps) {
  const [showAdd, setShowAdd] = useState(false);
  const myProjects = useMyProjects();
  const addMember = useAddArmyMember();
  const removeMember = useRemoveArmyMember();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allProjects = (myProjects.data as any)?.pages?.flatMap((p: any) => p.items) || [];
  const memberProjectIds = new Set(members.map((m) => m.project));
  const availableProjects = allProjects.filter(
    (p: RecordModel) => !memberProjectIds.has(p.id)
  );

  const handleAdd = async (projectId: string) => {
    await addMember.mutateAsync({ armyId, projectId });
    setShowAdd(false);
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('Remove this project from the army?')) return;
    await removeMember.mutateAsync({ memberId, armyId });
  };

  return (
    <div className="space-y-2">
      {/* Current Members with remove buttons */}
      {members.map((member: RecordModel) => {
        const project = member.expand?.project;
        if (!project) return null;
        return (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2"
          >
            <span className="text-sm text-foreground line-clamp-1">{project.name}</span>
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
        <div className="rounded-lg border border-border bg-card p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Add a project</span>
            <button
              onClick={() => setShowAdd(false)}
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
