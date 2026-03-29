import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PocketBase from 'pocketbase';
import { getDisplayName } from '@paintpile/shared';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thepaintpile.com';

function getImageUrl(collectionId: string, recordId: string, filename: string) {
  return `${PB_URL}/api/files/${collectionId}/${recordId}/${filename}`;
}

function parseJSON<T>(value: unknown, fallback: T): T {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as T;
  if (Array.isArray(value)) return value as T;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return fallback; }
  }
  return fallback;
}

interface StepItem {
  description: string;
  mediaIndex: number | null;
  paints: Array<{ id: string; name: string; brand: string; hex_color: string }>;
}

interface StepsData {
  coverMediaIndex: number | null;
  items: StepItem[];
}

async function getPost(postId: string) {
  try {
    const pb = new PocketBase(PB_URL);
    return await pb.collection('palette_posts').getOne(postId, { expand: 'user' });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ postId: string }>;
}): Promise<Metadata> {
  const { postId } = await params;
  const post = await getPost(postId);

  if (!post) return { title: 'Tutorial Not Found - Paintpile' };

  const userName = getDisplayName(post.expand?.user, 'A painter');
  const title = `${post.title || 'Painting Tutorial'} by ${userName} - Paintpile`;
  const description = post.caption
    ? post.caption.slice(0, 160)
    : 'Check out this painting tutorial on Paintpile!';
  const url = `${SITE_URL}/share/palette-post/${postId}`;
  const images: string[] = [];
  if (post.image) {
    images.push(getImageUrl(post.collectionId, post.id, post.image));
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

export default async function SharePalettePostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const post = await getPost(postId);

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="space-y-4 p-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Tutorial Not Found</h1>
          <p className="text-muted-foreground">
            This tutorial may have been removed or set to private.
          </p>
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

  if (!post.is_public) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="space-y-4 p-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Private Tutorial</h1>
          <p className="text-muted-foreground">This tutorial is private.</p>
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

  const userName = getDisplayName(post.expand?.user, 'A painter');
  const paints = parseJSON<Array<{ id: string; name: string; brand: string; hex_color: string }>>(
    post.paints,
    []
  );
  const stepsData = parseJSON<StepsData>(post.steps, { coverMediaIndex: null, items: [] });
  const mediaFiles: string[] = Array.isArray(post.media) ? post.media : [];
  const isTutorial = post.mode === 'tutorial';

  const coverUrl = post.image
    ? getImageUrl(post.collectionId, post.id, post.image)
    : stepsData.coverMediaIndex !== null && mediaFiles[stepsData.coverMediaIndex]
    ? getImageUrl(post.collectionId, post.id, mediaFiles[stepsData.coverMediaIndex])
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Top banner */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/">
            <picture><source srcSet="/logosmall.webp" type="image/webp" /><img src="/logosmall.png" alt="Paintpile" className="h-9 w-auto" /></picture>
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

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {/* Cover */}
        {coverUrl && (
          <div className="overflow-hidden rounded-xl bg-card">
            {stepsData.coverMediaIndex !== null &&
            mediaFiles[stepsData.coverMediaIndex] &&
            /\.(mp4|webm|mov|ogg)$/i.test(mediaFiles[stepsData.coverMediaIndex]) ? (
              <video
                src={getImageUrl(post.collectionId, post.id, mediaFiles[stepsData.coverMediaIndex])}
                autoPlay
                loop
                muted
                playsInline
                className="w-full"
              />
            ) : (
              <img src={coverUrl} alt={post.title || 'Tutorial'} className="w-full object-contain" />
            )}
          </div>
        )}

        {/* Title & author */}
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {isTutorial ? 'Tutorial' : 'Palette Post'}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-foreground">
            {post.title || 'Untitled Tutorial'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">by {userName}</p>
          {post.attribution && post.attribution !== userName && (
            <p className="text-xs text-muted-foreground">{post.attribution}</p>
          )}
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {post.caption}
          </p>
        )}

        {/* Paints used */}
        {paints.length > 0 && (
          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">Paints Used</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {paints.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
                >
                  <span
                    className="h-5 w-5 shrink-0 rounded-full border border-border"
                    style={{ backgroundColor: p.hex_color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                    {p.brand && (
                      <p className="truncate text-xs text-muted-foreground">{p.brand}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tutorial steps */}
        {isTutorial && stepsData.items.length > 0 && (
          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">Steps</h2>
            <ol className="space-y-4">
              {stepsData.items.map((step, i) => {
                const mediaFilename =
                  step.mediaIndex !== null ? mediaFiles[step.mediaIndex] : null;
                const mediaUrl = mediaFilename
                  ? getImageUrl(post.collectionId, post.id, mediaFilename)
                  : null;
                const isVideo =
                  mediaFilename ? /\.(mp4|webm|mov|ogg)$/i.test(mediaFilename) : false;

                return (
                  <li key={i} className="overflow-hidden rounded-lg border border-border bg-card">
                    {/* Step media */}
                    {mediaUrl && (
                      <div className="bg-black/5">
                        {isVideo ? (
                          <video
                            src={mediaUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="max-h-72 w-full object-cover"
                          />
                        ) : (
                          <img
                            src={mediaUrl}
                            alt={`Step ${i + 1}`}
                            className="max-h-72 w-full object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>
                    )}

                    <div className="p-4">
                      <div className="flex gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                          {i + 1}
                        </span>
                        <div className="flex-1 space-y-3">
                          {step.description && (
                            <p className="whitespace-pre-wrap text-sm text-foreground">
                              {step.description}
                            </p>
                          )}

                          {/* Per-step paints */}
                          {step.paints && step.paints.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {step.paints.map((p) => (
                                <span
                                  key={p.id}
                                  className="flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                                >
                                  <span
                                    className="h-2.5 w-2.5 rounded-full border border-border"
                                    style={{ backgroundColor: p.hex_color }}
                                  />
                                  {p.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
          <h3 className="text-lg font-bold text-foreground">
            Want to create and share your own tutorials?
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Join Paintpile to build step-by-step painting tutorials with video, track your
            projects, and connect with fellow painters.
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
