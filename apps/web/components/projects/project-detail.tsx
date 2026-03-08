'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { RecordModel } from 'pocketbase';
import { ArrowLeft, Edit2, Trash2, Palette, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../auth-provider';
import { useDeleteProject, useUpdateProject } from '../../hooks/use-projects';
import { ProjectStatusBadge } from './project-status-badge';
import { LikeButton } from '../social/like-button';
import { CommentSection } from '../social/comment-section';
import { AIActionBar } from '../ai/ai-action-bar';
import { AIQuotaBadge } from '../ai/ai-quota-badge';
import { getFileUrl, relativeTime } from '../../lib/pb-helpers';

interface ProjectDetailProps {
  project: RecordModel;
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  const deleteProject = useDeleteProject();
  const updateProject = useUpdateProject();
  const isOwner = user?.id === project.user;

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [editDescription, setEditDescription] = useState(project.description || '');
  const [editStatus, setEditStatus] = useState(project.status || 'not-started');

  const coverPhoto = project.cover_photo
    ? getFileUrl(project, project.cover_photo, '800x600')
    : null;

  const handleDelete = async () => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    await deleteProject.mutateAsync(project.id);
    router.push('/projects');
  };

  const handleSaveEdit = async () => {
    await updateProject.mutateAsync({
      projectId: project.id,
      data: {
        name: editName.trim(),
        description: editDescription.trim(),
        status: editStatus,
      },
    });
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/projects')}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-muted-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded border border-border px-2 py-1 text-lg font-bold focus:border-primary focus:outline-none"
            />
          ) : (
            <h1 className="truncate text-xl font-bold text-foreground">{project.name}</h1>
          )}
          <p className="text-xs text-muted-foreground">{relativeTime(project.created)}</p>
        </div>
        {isOwner && !editing && (
          <div className="flex gap-1">
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-muted-foreground"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg p-2 text-muted-foreground hover:bg-red-900/30 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
        {editing && (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={updateProject.isPending}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary/80 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Cover Photo */}
      {coverPhoto && (
        <div className="overflow-hidden rounded-lg">
          <img
            src={coverPhoto}
            alt={project.name}
            className="w-full object-cover"
            style={{ maxHeight: '400px' }}
          />
        </div>
      )}

      {/* Status + Stats */}
      <div className="flex items-center gap-4">
        {editing ? (
          <select
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value)}
            className="rounded-lg border border-border px-2 py-1 text-sm focus:border-primary focus:outline-none"
          >
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        ) : (
          <ProjectStatusBadge status={project.status || 'not-started'} />
        )}
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <ImageIcon className="h-3.5 w-3.5" />
          {project.photo_count || 0} photos
        </span>
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <Palette className="h-3.5 w-3.5" />
          {project.paint_count || 0} paints
        </span>
      </div>

      {/* Description */}
      {editing ? (
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          rows={4}
          className="w-full resize-none rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      ) : (
        project.description && (
          <p className="whitespace-pre-wrap text-sm text-foreground">{project.description}</p>
        )
      )}

      {/* Tags */}
      {project.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {project.tags.map((tag: string) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* AI Features */}
      {isOwner && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">AI Tools</h3>
            <AIQuotaBadge />
          </div>
          <AIActionBar
            projectId={project.id}
            imageUrl={coverPhoto ? getFileUrl(project, project.cover_photo) : null}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 border-t border-border pt-3">
        <LikeButton targetId={project.id} targetType="project" initialCount={project.like_count || 0} />
      </div>

      {/* Comments */}
      <CommentSection targetId={project.id} targetType="project" commentCount={project.comment_count || 0} />
    </div>
  );
}
