// URL filters for the gallery (?color=Deep Violet&technique=glazing&…).
// Every chip on a project page links into one of these.
import type PocketBase from 'pocketbase';
import { KINDS, labelFor, SOURCES, STYLES, TECHNIQUES } from './project-details';

export interface GalleryFilters {
  color?: string;
  technique?: string;
  style?: string;
  kind?: string;
  source?: string;
  tag?: string;
}

const KEYS = ['color', 'technique', 'style', 'kind', 'source', 'tag'] as const;

export function parseGalleryFilters(params: Record<string, string | string[] | undefined>): GalleryFilters {
  const out: GalleryFilters = {};
  for (const key of KEYS) {
    const v = params[key];
    if (typeof v === 'string' && v.trim() && v.length <= 60) out[key] = v.trim();
  }
  return out;
}

/** PocketBase filter for the active filters, or undefined when there are none. */
export function galleryFilterExpr(pb: PocketBase, f: GalleryFilters): string | undefined {
  const parts: string[] = [];
  // JSON fields: `~` is a contains-match on the stored JSON text.
  if (f.color) parts.push(pb.filter('color_scheme ~ {:v}', { v: f.color }));
  if (f.technique) parts.push(pb.filter('techniques ~ {:v}', { v: `"${f.technique}"` }));
  if (f.tag) parts.push(pb.filter('tags ~ {:v}', { v: `"${f.tag}"` }));
  if (f.style) parts.push(pb.filter('style = {:v}', { v: f.style }));
  if (f.kind) parts.push(pb.filter('kind = {:v}', { v: f.kind }));
  if (f.source) parts.push(pb.filter('source = {:v}', { v: f.source }));
  return parts.length ? parts.join(' && ') : undefined;
}

/** Human label for the active filters, e.g. "Deep Violet · Glazing". */
export function describeFilters(f: GalleryFilters): string | null {
  const labels = [
    f.color,
    labelFor(TECHNIQUES, f.technique) ?? f.technique,
    labelFor(STYLES, f.style) ?? f.style,
    labelFor(KINDS, f.kind) ?? f.kind,
    labelFor(SOURCES, f.source) ?? f.source,
    f.tag && `#${f.tag}`,
  ].filter(Boolean);
  return labels.length ? labels.join(' · ') : null;
}

export function filterHref(f: GalleryFilters): string {
  const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v) as [string, string][]).toString();
  return qs ? `/?${qs}` : '/';
}
