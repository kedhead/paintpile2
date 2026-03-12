'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { RecordModel } from 'pocketbase';
import { ArrowLeft, Edit2, Trash2, Palette, Image as ImageIcon, Camera, Clock, ChefHat, Share2, Check, Link2, Award } from 'lucide-react';
import { useAuth } from '../auth-provider';
import { useDeleteProject, useUpdateProject } from '../../hooks/use-projects';
import { ProjectStatusBadge } from './project-status-badge';
import { LikeButton } from '../social/like-button';
import { CommentSection } from '../social/comment-section';
import { AIActionBar } from '../ai/ai-action-bar';
import { AIQuotaBadge } from '../ai/ai-quota-badge';
import { getFileUrl, relativeTime } from '../../lib/pb-helpers';
import { PhotoGallery } from './photo-gallery';
import { PhotoUpload } from './photo-upload';
import { ProjectPaintLibrary } from './project-paint-library';
import { ProjectTimeline } from './project-timeline';
import { ProjectRecipesList } from './project-recipes-list';

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
  const [activeTab, setActiveTab] = useState<'photos' | 'paints' | 'timeline' | 'recipes'>('photos');
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const coverPhoto = project.cover_photo
    ? getFileUrl(project, project.cover_photo, '800x600')
    : null;

  const critique = (() => {
    try {
      if (!project.last_critique) return null;
      const raw = typeof project.last_critique === 'string'
        ? JSON.parse(project.last_critique)
        : project.last_critique;
      return raw;
    } catch { return null; }
  })();

  const gradeColors: Record<string, string> = {
    S: 'text-amber-400 border-amber-400 bg-amber-400/10',
    A: 'text-green-400 border-green-400 bg-green-400/10',
    B: 'text-blue-400 border-blue-400 bg-blue-400/10',
    C: 'text-gray-400 border-gray-400 bg-gray-400/10',
    D: 'text-orange-400 border-orange-400 bg-orange-400/10',
    F: 'text-red-400 border-red-400 bg-red-400/10',
  };

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
            className="w-full object-contain"
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

      {/* Critique Grade */}
      {critique && critique.grade && (
        <div className={`flex items-center gap-3 rounded-lg border p-3 ${gradeColors[critique.grade] || 'text-muted-foreground border-border bg-muted'}`}>
          <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-full border-2 border-current">
            <span className="text-lg font-black">{critique.grade}</span>
            <span className="text-[9px] font-semibold">{critique.score}/100</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <Award className="h-4 w-4" />
              AI Critique
            </div>
            {critique.analysis && (
              <p className="mt-0.5 text-xs opacity-80 line-clamp-2">{critique.analysis}</p>
            )}
          </div>
        </div>
      )}

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
      {Array.isArray(project.tags) && project.tags.length > 0 && (
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

      {/* Tabbed Sections */}
      <div className="space-y-3">
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">
          {[
            { key: 'photos' as const, label: 'Photos', icon: Camera },
            { key: 'paints' as const, label: 'Paints', icon: Palette },
            { key: 'timeline' as const, label: 'Timeline', icon: Clock },
            { key: 'recipes' as const, label: 'Recipes', icon: ChefHat },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'photos' && (
          <div className="space-y-3">
            <PhotoGallery projectId={project.id} isOwner={isOwner} />
            {isOwner && <PhotoUpload projectId={project.id} />}
          </div>
        )}
        {activeTab === 'paints' && (
          <ProjectPaintLibrary projectId={project.id} isOwner={isOwner} />
        )}
        {activeTab === 'timeline' && (
          <ProjectTimeline projectId={project.id} />
        )}
        {activeTab === 'recipes' && (
          <ProjectRecipesList projectId={project.id} isOwner={isOwner} />
        )}
      </div>

      {/* AI Features */}
      {isOwner && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">AI Tools</h3>
            <AIQuotaBadge />
          </div>
          <AIActionBar
            projectId={project.id}
            projectName={project.name}
            imageUrl={coverPhoto ? getFileUrl(project, project.cover_photo) : null}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 border-t border-border pt-3">
        <LikeButton targetId={project.id} targetType="project" initialCount={project.like_count || 0} />
        <div className="relative">
          <button
            onClick={() => setShowShare(!showShare)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          {showShare && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowShare(false)} />
              <div className="absolute bottom-full left-0 z-50 mb-2 w-56 rounded-lg border border-border bg-card p-1.5 shadow-lg">
                {!project.is_public ? (
                  <p className="px-2 py-1.5 text-xs text-amber-400">Make your project public first to share it.</p>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/share/project/${project.id}`);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                        setTimeout(() => setShowShare(false), 1500);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Link2 className="h-3.5 w-3.5" />}
                      {copied ? 'Link copied!' : 'Copy link'}
                    </button>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my miniature painting project "${project.name}" on Paintpile!`)}&url=${encodeURIComponent(`${window.location.origin}/share/project/${project.id}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      X / Twitter
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/share/project/${project.id}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Facebook
                    </a>
                    <a
                      href={`https://www.reddit.com/submit?url=${encodeURIComponent(`${window.location.origin}/share/project/${project.id}`)}&title=${encodeURIComponent(project.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Reddit
                    </a>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Comments */}
      <CommentSection targetId={project.id} targetType="project" commentCount={project.comment_count || 0} />
    </div>
  );
}
