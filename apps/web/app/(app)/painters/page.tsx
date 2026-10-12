import type { Metadata } from 'next';
import Link from 'next/link';
import type { RecordModel } from 'pocketbase';
import { UserAvatar } from '../../../components/social/user-avatar';
import { FollowButton } from '../../../components/social/follow-button';
import { fileUrl, publicPb, safe } from '../../../lib/pb-server';
import { profilePath, projectPath } from '../../../lib/urls';

export const metadata: Metadata = {
  title: 'Painters — Paintpile',
  description: 'Find miniature painters to follow, and browse their painted projects and paint recipes.',
};

type Sort = 'popular' | 'active';

export default async function PaintersPage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const sort: Sort = (await searchParams).sort === 'active' ? 'active' : 'popular';
  const pb = publicPb();

  // Painters are whoever has public work: rank by followers, or by who posted most recently.
  const recentProjects = await safe(
    () =>
      pb.collection('projects').getList(1, 300, {
        filter: 'is_public = true && cover_photo != ""',
        sort: '-created',
        expand: 'user',
      }),
    null,
  );

  const byUser = new Map<string, { user: RecordModel; projects: RecordModel[] }>();
  for (const project of recentProjects?.items ?? []) {
    const user = project.expand?.user as RecordModel | undefined;
    if (!user) continue;
    const entry = byUser.get(user.id) ?? { user, projects: [] };
    entry.projects.push(project);
    byUser.set(user.id, entry);
  }

  const ids = [...byUser.keys()];
  const stats = ids.length
    ? await safe(
        () =>
          pb.collection('user_stats').getFullList({
            filter: ids.map((id) => pb.filter('user = {:id}', { id })).join(' || '),
          }),
        [],
      )
    : [];
  const followers = new Map(stats.map((s) => [s.user as string, (s.follower_count as number) || 0]));

  const painters = [...byUser.values()];
  if (sort === 'popular') {
    painters.sort((a, b) => (followers.get(b.user.id) ?? 0) - (followers.get(a.user.id) ?? 0));
  }
  // 'active' keeps first-seen order, which is newest project first.

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-bebas text-4xl tracking-wide text-foreground">Painters</h1>
          <p className="text-sm text-muted-foreground">Find painters whose work you want to see more of.</p>
        </div>
        <div className="inline-flex rounded-xl border border-border bg-card p-1">
          {(['popular', 'active'] as const).map((id) => (
            <Link
              key={id}
              href={id === 'popular' ? '/painters' : '/painters?sort=active'}
              className={`rounded-lg px-4 py-1.5 text-sm ${
                id === sort ? 'bg-muted font-semibold text-foreground' : 'font-medium text-muted-foreground hover:text-foreground'
              }`}
            >
              {id === 'popular' ? 'Most followed' : 'Recently active'}
            </Link>
          ))}
        </div>
      </div>

      {painters.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No painters with public projects yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {painters.map(({ user, projects }) => (
            <article key={user.id} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="grid grid-cols-3 gap-0.5 bg-border">
                {[0, 1, 2].map((i) => {
                  const p = projects[i];
                  return p ? (
                    <Link key={p.id} href={projectPath(p)} className="aspect-square bg-muted">
                      <img src={fileUrl(p, p.cover_photo, '300x300')} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                    </Link>
                  ) : (
                    <div key={i} className="aspect-square bg-muted" />
                  );
                })}
              </div>
              <div className="flex items-center gap-3 p-4">
                <Link href={profilePath(user)} className="flex min-w-0 flex-1 items-center gap-3">
                  <UserAvatar user={user} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{user.name || user.username}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.username ? `@${user.username} · ` : ''}
                      {followers.get(user.id) ?? 0} followers
                    </p>
                  </div>
                </Link>
                <FollowButton targetUserId={user.id} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
