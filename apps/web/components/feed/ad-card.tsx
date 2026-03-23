'use client';

import type { RecordModel } from 'pocketbase';
import { getFileUrl } from '../../lib/pb-helpers';
import { AdSenseSlot } from '../ads/adsense-slot';

interface AdCardProps {
  ad?: RecordModel;
}

export function AdCard({ ad }: AdCardProps) {
  if (!ad) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <AdSenseSlot />
      </div>
    );
  }

  const imageUrl = ad.image ? getFileUrl(ad, ad.image) : null;

  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {ad.label || 'Sponsored'}
        </span>
      </div>

      <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="block">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={ad.title || 'Advertisement'}
            className="w-full rounded-md object-cover"
          />
        )}
        {ad.title && (
          <p className="mt-2 text-sm font-medium text-foreground">{ad.title}</p>
        )}
      </a>
    </article>
  );
}
