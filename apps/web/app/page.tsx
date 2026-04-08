import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import PocketBase from 'pocketbase';

export const metadata: Metadata = {
  title: 'Paintpile - The Community for Miniature Painters',
  description:
    'Track your miniature painting projects, get AI-powered critiques, manage 4,700+ paints, share recipes, and connect with fellow hobbyists.',
};

const PB_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';

export default async function HomePage() {
  // Authenticated users go straight to feed
  const cookieStore = await cookies();
  const auth = cookieStore.get('pb_auth');
  if (auth?.value) {
    redirect('/feed');
  }

  // Fetch recent posts for crawler-visible content
  let recentPosts: { id: string; caption: string; created: string; authorName: string }[] = [];
  try {
    const pb = new PocketBase(PB_URL);
    const result = await pb.collection('posts').getList(1, 10, {
      sort: '-created',
      filter: 'is_public = true',
      expand: 'user',
      fields: 'id,caption,created,expand.user.name,expand.user.username',
    });
    recentPosts = result.items.map((p) => ({
      id: p.id,
      caption: (p.caption as string) || '',
      created: p.created as string,
      authorName: (p.expand?.user?.name || p.expand?.user?.username || 'A painter') as string,
    }));
  } catch {
    // PB unreachable
  }

  // Non-authenticated visitors see a minimal page with real content, then redirect via JS
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <noscript>
        <meta httpEquiv="refresh" content="0;url=/auth/login" />
      </noscript>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.replace('/auth/login');`,
        }}
      />

      <h1 className="mb-4 text-3xl font-bold text-foreground">
        Paintpile — The Community for Miniature Painters
      </h1>
      <p className="mb-8 text-lg text-muted-foreground">
        Track your miniature painting projects, get AI-powered critiques, manage 4,700+ paints,
        share recipes, and connect with fellow hobbyists.
      </p>

      <h2 className="mb-4 text-xl font-semibold text-foreground">Recent Posts</h2>
      <ul className="space-y-3">
        {recentPosts.map((post) => (
          <li key={post.id} className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-medium text-foreground">{post.authorName}</p>
            {post.caption && (
              <p className="mt-1 text-sm text-muted-foreground">{post.caption}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(post.created).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-8 space-y-2 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">Features</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Track miniature painting projects with photos and progress logs</li>
          <li>AI-powered painting critiques and improvement suggestions</li>
          <li>Paint library with 4,700+ paints across major brands</li>
          <li>Share and discover paint recipes and color schemes</li>
          <li>Community feed with posts, likes, and comments</li>
          <li>Follow other painters and build your network</li>
          <li>Color matching and paint mixing tools</li>
          <li>Lighting reference tool for painting setups</li>
        </ul>
      </div>
    </div>
  );
}
