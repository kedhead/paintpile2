'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { RecordModel } from 'pocketbase';
import { ArrowLeft, Edit2, Trash2, Shield, Users } from 'lucide-react';
import { useAuth } from '../auth-provider';
import { useDeleteArmy, useArmyMembers } from '../../hooks/use-armies';
import { ArmyForm } from './army-form';
import { ArmyMemberManager } from './army-member-manager';
import { LikeButton } from '../social/like-button';
import { CommentSection } from '../social/comment-section';
import { getFileUrl, relativeTime } from '../../lib/pb-helpers';

interface ArmyDetailProps {
  army: RecordModel;
}

export function ArmyDetail({ army }: ArmyDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  const deleteArmy = useDeleteArmy();
  const membersQuery = useArmyMembers(army.id);
  const isOwner = user?.id === army.user;

  const [showEdit, setShowEdit] = useState(false);

  const coverPhoto = army.cover_photo
    ? getFileUrl(army, army.cover_photo, '800x600')
    : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const members = (membersQuery.data as any)?.pages?.flatMap((p: any) => p.items) || [];

  const handleDelete = async () => {
    if (!confirm('Delete this army? This cannot be undone.')) return;
    await deleteArmy.mutateAsync(army.id);
    router.push('/armies');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/armies')}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-foreground">{army.name}</h1>
          <p className="text-xs text-muted-foreground">{relativeTime(army.created)}</p>
        </div>
        {isOwner && (
          <div className="flex gap-1">
            <button
              onClick={() => setShowEdit(true)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg p-2 text-muted-foreground hover:bg-red-900/20 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Cover Photo */}
      {coverPhoto ? (
        <div className="overflow-hidden rounded-lg">
          <img
            src={coverPhoto}
            alt={army.name}
            className="w-full object-cover"
            style={{ maxHeight: '400px' }}
          />
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-lg bg-muted">
          <Shield className="h-16 w-16 text-muted-foreground" />
        </div>
      )}

      {/* Faction + Stats */}
      <div className="flex items-center gap-4">
        {army.faction && (
          <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground">
            {army.faction}
          </span>
        )}
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          {army.project_count || 0} projects
        </span>
      </div>

      {/* Description */}
      {army.description && (
        <p className="whitespace-pre-wrap text-sm text-foreground">{army.description}</p>
      )}

      {/* Tags */}
      {army.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {army.tags.map((tag: string) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Member Projects */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Projects in Army</h3>
          <span className="text-xs text-muted-foreground">{members.length} projects</span>
        </div>

        {isOwner && <ArmyMemberManager armyId={army.id} members={members} />}

        {members.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {members.map((member: RecordModel) => {
              const project = member.expand?.project;
              if (!project) return null;
              return (
                <div
                  key={member.id}
                  className="overflow-hidden rounded-lg border border-border bg-card p-2"
                >
                  <p className="text-sm font-medium text-foreground line-clamp-1">
                    {project.name}
                  </p>
                  {project.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                      {project.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">No projects added yet.</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 border-t border-border pt-3">
        <LikeButton targetId={army.id} targetType="army" initialCount={army.like_count || 0} />
      </div>

      {/* Comments */}
      <CommentSection targetId={army.id} targetType="army" commentCount={army.comment_count || 0} />

      {/* Edit Dialog */}
      {showEdit && <ArmyForm army={army} onClose={() => setShowEdit(false)} />}
    </div>
  );
}
