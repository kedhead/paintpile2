'use client';

import Link from 'next/link';
import type { RecordModel } from 'pocketbase';
import { BookOpen, Palette, ExternalLink } from 'lucide-react';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thepaintpile.com';

function getFileUrl(collectionId: string, recordId: string, filename: string) {
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

interface PalettePostCardProps {
  post: RecordModel;
}

export function PalettePostCard({ post }: PalettePostCardProps) {
  const paints = parseJSON<Array<{ name: string; hex_color: string }>>(post.paints, []);
  const steps = parseJSON<{ items?: unknown[] }>(post.steps, {});
  const stepCount = steps.items?.length ?? 0;

  const coverUrl = post.image
    ? getFileUrl(post.collectionId, post.id, post.image)
    : null;

  const shareUrl = `${SITE_URL}/share/palette-post/${post.id}`;

  return (
    <Link href={`/share/palette-post/${post.id}`} target="_blank">
      <article className="group overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
        {/* Cover image */}
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={post.title || 'Tutorial'}
            className="h-32 w-full object-cover"
          />
        ) : (
          <div className="h-32 w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-primary/40" />
          </div>
        )}

        <div className="p-4">
          {/* Title */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="h-4 w-4 shrink-0 text-primary" />
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary line-clamp-1">
                {post.title || 'Untitled Tutorial'}
              </h3>
            </div>
            <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Tutorial
            </span>
          </div>

          {/* Attribution */}
          {post.attribution && (
            <p className="mt-1 text-xs text-muted-foreground">{post.attribution}</p>
          )}

          {/* Paint swatches preview */}
          {paints.length > 0 && (
            <div className="mt-2 flex items-center gap-1">
              {paints.slice(0, 8).map((p, i) => (
                <span
                  key={i}
                  className="h-4 w-4 rounded-full border border-border"
                  style={{ backgroundColor: p.hex_color }}
                  title={p.name}
                />
              ))}
              {paints.length > 8 && (
                <span className="text-[10px] text-muted-foreground ml-0.5">+{paints.length - 8}</span>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            {stepCount > 0 && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {stepCount} step{stepCount !== 1 ? 's' : ''}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Palette className="h-3 w-3" />
              {paints.length} paint{paints.length !== 1 ? 's' : ''}
            </span>
            {post.is_public && (
              <span className="ml-auto flex items-center gap-1 text-green-400">
                <ExternalLink className="h-3 w-3" />
                Public
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
