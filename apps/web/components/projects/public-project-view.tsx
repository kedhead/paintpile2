import Link from 'next/link';
import type { RecordModel } from 'pocketbase';
import { MessageCircle, Palette } from 'lucide-react';
import { UserAvatar } from '../social/user-avatar';
import { FollowButton } from '../social/follow-button';
import { LikeButton } from '../social/like-button';
import { CommentSection } from '../social/comment-section';
import { GalleryCard } from '../gallery/gallery-card';
import { PhotoViewer } from './photo-viewer';
import { fileUrl } from '../../lib/pb-server';
import { profilePath } from '../../lib/urls';

interface PublicProjectViewProps {
  project: RecordModel;
  photos: RecordModel[];
  projectPaints: RecordModel[];
  moreFromAuthor: RecordModel[];
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export function PublicProjectView({ project, photos, projectPaints, moreFromAuthor }: PublicProjectViewProps) {
  const author = project.expand?.user as RecordModel | undefined;

  // Cover first, then the rest of the photo set.
  const viewerPhotos = [
    ...(project.cover_photo
      ? [{ id: 'cover', full: fileUrl(project, project.cover_photo), thumb: fileUrl(project, project.cover_photo, '128x128') }]
      : []),
    ...photos.map((p) => ({ id: p.id, full: fileUrl(p, p.image), thumb: fileUrl(p, p.image, '128x128') })),
  ];

  const paints = projectPaints
    .map((pp) => pp.expand?.paint as RecordModel | undefined)
    .filter((p): p is RecordModel => !!p);

  const tags: string[] = Array.isArray(project.tags) ? project.tags : [];

  return (
    <div className="space-y-12">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          {viewerPhotos.length > 0 ? (
            <PhotoViewer photos={viewerPhotos} alt={project.name} />
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-2xl bg-muted">
              <Palette className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          {author && (
            <div className="flex items-center gap-3">
              <Link href={profilePath(author)} className="flex min-w-0 flex-1 items-center gap-3">
                <UserAvatar user={author} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{author.name || author.username}</p>
                  {author.username && <p className="truncate text-xs text-muted-foreground">@{author.username}</p>}
                </div>
              </Link>
              <FollowButton targetUserId={author.id} />
            </div>
          )}

          <div>
            <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Posted {new Date(project.created).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-5 border-y border-border py-3">
            <LikeButton targetId={project.id} targetType="project" initialCount={project.like_count || 0} />
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              {project.comment_count || 0}
            </span>
          </div>

          {project.description && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{project.description}</p>
          )}

          {paints.length > 0 && (
            <Section title={`Paints used (${paints.length})`}>
              <ul className="space-y-1.5">
                {paints.map((paint) => (
                  <li key={paint.id} className="flex items-center gap-2.5 text-sm">
                    <span
                      className="h-5 w-5 shrink-0 rounded-full border border-border"
                      style={{ background: paint.hex_color }}
                      aria-hidden
                    />
                    <span className="min-w-0 truncate text-foreground">{paint.name}</span>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">{paint.brand}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {tags.length > 0 && (
            <Section title="Tags">
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </Section>
          )}

          <CommentSection
            targetId={project.id}
            targetType="project"
            commentCount={project.comment_count || 0}
            defaultExpanded
          />
        </aside>
      </div>

      {author && moreFromAuthor.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-foreground">More from {author.username || author.name}</h2>
            <Link href={profilePath(author)} className="text-sm text-primary hover:underline">View profile</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {moreFromAuthor.map((p) => (
              <GalleryCard key={p.id} project={p} showAuthor={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
