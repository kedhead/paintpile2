import type { Metadata } from 'next';
import Link from 'next/link';
import { Palette, Image as ImageIcon, Clock, ArrowRight, User } from 'lucide-react';
import PocketBase from 'pocketbase';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thepaintpile.com';

async function getProject(projectId: string) {
  try {
    const pb = new PocketBase(PB_URL);
    const project = await pb.collection('projects').getOne(projectId, {
      expand: 'user',
    });
    return project;
  } catch {
    return null;
  }
}

function getImageUrl(collectionId: string, recordId: string, filename: string) {
  return `${PB_URL}/api/files/${collectionId}/${recordId}/${filename}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}): Promise<Metadata> {
  const { projectId } = await params;
  const project = await getProject(projectId);

  if (!project) {
    return { title: 'Project Not Found - Paintpile' };
  }

  const userName = project.expand?.user?.name || project.expand?.user?.displayName || 'A painter';
  const title = `${project.name} by ${userName} - Paintpile`;
  const description = project.description
    || `Check out this miniature painting project on Paintpile!`;
  const url = `${SITE_URL}/share/project/${projectId}`;

  const images: string[] = [];
  if (project.cover_photo) {
    images.push(getImageUrl(project.collectionId, project.id, project.cover_photo));
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Paintpile',
      type: 'article',
      images: images.length > 0 ? images : undefined,
    },
    twitter: {
      card: images.length > 0 ? 'summary_large_image' : 'summary',
      title,
      description,
      images: images.length > 0 ? images : undefined,
    },
  };
}

const statusLabels: Record<string, string> = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  'completed': 'Completed',
};

const statusColors: Record<string, string> = {
  'not-started': 'bg-gray-500/20 text-gray-400',
  'in-progress': 'bg-blue-500/20 text-blue-400',
  'completed': 'bg-green-500/20 text-green-400',
};

export default async function ShareProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await getProject(projectId);

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold text-foreground">Project Not Found</h1>
          <p className="text-muted-foreground">This project may have been removed or set to private.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
          >
            Go to Paintpile
          </Link>
        </div>
      </div>
    );
  }

  if (!project.is_public) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold text-foreground">Private Project</h1>
          <p className="text-muted-foreground">This project is private. Sign in to view it.</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const userName = project.expand?.user?.name || project.expand?.user?.displayName || 'A painter';
  const coverUrl = project.cover_photo
    ? getImageUrl(project.collectionId, project.id, project.cover_photo)
    : null;
  const status = project.status || 'not-started';

  // Get project photos
  let photos: { id: string; collectionId: string; image: string }[] = [];
  try {
    const pb = new PocketBase(PB_URL);
    const photoRecords = await pb.collection('photos').getList(1, 12, {
      filter: `project="${projectId}"`,
      sort: 'sort_order',
    });
    photos = photoRecords.items.map((p) => ({
      id: p.id,
      collectionId: p.collectionId,
      image: p.image,
    }));
  } catch {
    // photos may not exist
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top banner */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center">
            <img src="/logosmall.png" alt="Paintpile" className="h-9 w-auto" />
          </Link>
          <Link
            href="/auth/signup"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
          >
            Join Paintpile
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Project content */}
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {/* Cover photo */}
        {coverUrl && (
          <div className="overflow-hidden rounded-xl">
            <img
              src={coverUrl}
              alt={project.name}
              className="w-full object-cover"
              style={{ maxHeight: '500px' }}
            />
          </div>
        )}

        {/* Title & Author */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {userName}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[status] || ''}`}>
              {statusLabels[status] || status}
            </span>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Tags */}
        {Array.isArray(project.tags) && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
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

        {/* Stats */}
        <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            <span>{project.photo_count || 0} photos</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Palette className="h-4 w-4" />
            <span>{project.paint_count || 0} paints</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{new Date(project.created).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Photo gallery */}
        {photos.length > 0 && (
          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">Photos</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {photos.map((photo) => (
                <div key={photo.id} className="overflow-hidden rounded-lg">
                  <img
                    src={getImageUrl(photo.collectionId, photo.id, photo.image)}
                    alt=""
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
          <h3 className="text-lg font-bold text-foreground">Want to share your own miniatures?</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Join Paintpile to track your projects, get AI-powered critiques, and connect with fellow painters.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/auth/signup"
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary/80"
            >
              Sign Up Free
            </Link>
            <Link
              href="/auth/login"
              className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
