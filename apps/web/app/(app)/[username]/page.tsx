import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { RecordModel } from 'pocketbase';
import { getDisplayName } from '@paintpile/shared';
import { ProfileHeader } from '../../../components/profile/profile-header';
import { ProfilePostGrid } from '../../../components/profile/profile-post-grid';
import { GalleryGrid } from '../../../components/gallery/gallery-grid';
import { fileUrl, publicPb, safe, SITE_URL } from '../../../lib/pb-server';
import { GALLERY_PAGE_SIZE, galleryQuery } from '../../../lib/gallery';
import { profilePath } from '../../../lib/urls';

type Props = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
};

async function loadUser(handle: string): Promise<RecordModel | null> {
  const value = decodeURIComponent(handle).toLowerCase();
  if (!/^[a-z0-9_]{1,30}$/.test(value)) return null;
  const pb = publicPb();
  return safe(
    () => pb.collection('users').getFirstListItem(pb.filter('username = {:v} || id = {:v}', { v: value })),
    null,
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await loadUser((await params).username);
  if (!user) return { title: 'Painter not found — Paintpile' };
  const name = getDisplayName(user);
  const title = `${user.name ? `${user.name} (${name})` : name} — Paintpile`;
  const description = user.bio || `Painted miniatures and paint recipes by ${name} on Paintpile.`;
  const images = user.avatar ? [fileUrl(user, user.avatar, '400x400')] : undefined;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${profilePath(user)}` },
    openGraph: { title, description, url: `${SITE_URL}${profilePath(user)}`, siteName: 'Paintpile', type: 'profile', images },
  };
}

export default async function PainterProfilePage({ params, searchParams }: Props) {
  const [{ username }, { tab }] = await Promise.all([params, searchParams]);
  const user = await loadUser(username);
  if (!user) notFound();

  const activeTab = tab === 'posts' ? 'posts' : 'projects';
  const pb = publicPb();
  const userFilter = pb.filter('user = {:id}', { id: user.id });
  const projects = await safe(
    () => pb.collection('projects').getList(1, GALLERY_PAGE_SIZE, galleryQuery('latest', userFilter)),
    null,
  );

  const base = profilePath(user);
  const tabClass = (active: boolean) =>
    `relative px-3 py-2 text-sm ${active ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground hover:text-foreground'}`;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ProfileHeader profileUser={user} />

      <nav className="flex gap-1 border-b border-border">
        <Link href={base} className={tabClass(activeTab === 'projects')}>
          Projects {projects ? <span className="text-muted-foreground">{projects.totalItems}</span> : null}
          {activeTab === 'projects' && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />}
        </Link>
        <Link href={`${base}?tab=posts`} className={tabClass(activeTab === 'posts')}>
          Posts
          {activeTab === 'posts' && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />}
        </Link>
      </nav>

      {activeTab === 'posts' ? (
        <div className="mx-auto max-w-2xl">
          <ProfilePostGrid userId={user.id} />
        </div>
      ) : !projects || projects.items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No public projects yet.
        </div>
      ) : (
        <GalleryGrid
          initialItems={projects.items}
          totalPages={projects.totalPages}
          sort="latest"
          filter={userFilter}
          showAuthor={false}
        />
      )}
    </div>
  );
}
