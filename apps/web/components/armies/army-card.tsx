'use client';

import Link from 'next/link';
import type { RecordModel } from 'pocketbase';
import { Shield, Users } from 'lucide-react';
import { getFileUrl, relativeTime } from '../../lib/pb-helpers';

interface ArmyCardProps {
  army: RecordModel;
}

export function ArmyCard({ army }: ArmyCardProps) {
  const coverPhoto = army.cover_photo
    ? getFileUrl(army, army.cover_photo, '400x300')
    : null;

  return (
    <Link href={`/projects/armies/${army.id}`}>
      <article className="group overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
        {/* Cover Photo */}
        <div className="aspect-[4/3] bg-muted">
          {coverPhoto ? (
            <img
              src={coverPhoto}
              alt={army.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Shield className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary line-clamp-1">
              {army.name}
            </h3>
            {army.faction && (
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {army.faction}
              </span>
            )}
          </div>

          {army.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{army.description}</p>
          )}

          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {army.project_count || 0} projects
            </span>
            <span className="ml-auto">{relativeTime(army.created)}</span>
          </div>

          {/* Tags */}
          {Array.isArray(army.tags) && army.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {army.tags.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
