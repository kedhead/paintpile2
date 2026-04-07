import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = {
  title: 'Paintpile - The Community for Miniature Painters',
  description: 'Share your miniature painting projects, get AI-powered critiques, discover paint recipes, and connect with fellow hobbyists. Join the community today.',
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('pb_auth');
  if (authCookie?.value) {
    redirect('/feed');
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <section className="text-center space-y-6 py-12">
        <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
          The Community for Miniature Painters
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Share your miniature painting projects, get AI-powered critiques and paint suggestions,
          discover recipes, and connect with fellow hobbyists.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/auth/signup"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Get Started — Free
          </Link>
          <Link
            href="/auth/login"
            className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted"
          >
            Sign In
          </Link>
        </div>
      </section>

      <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 py-12">
        <div className="rounded-lg border border-border bg-card p-6 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">AI Critiques</h2>
          <p className="text-sm text-muted-foreground">
            Get detailed feedback on your miniature painting with AI-powered analysis covering
            color theory, brush technique, highlighting, and more.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Paint Suggestions</h2>
          <p className="text-sm text-muted-foreground">
            Upload a photo and get personalized paint recommendations from brands like
            Citadel, Vallejo, Army Painter, and more.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Paint Recipes</h2>
          <p className="text-sm text-muted-foreground">
            Create, share, and discover step-by-step painting recipes. Learn techniques
            from the community and share your own methods.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Project Tracking</h2>
          <p className="text-sm text-muted-foreground">
            Organize your miniature painting projects with photo galleries, paint libraries,
            and progress tracking from start to finish.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Community Feed</h2>
          <p className="text-sm text-muted-foreground">
            Share your work, follow other painters, join groups, and participate
            in community painting challenges.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Paint Collection</h2>
          <p className="text-sm text-muted-foreground">
            Catalog your paint collection, search by color, and find matching paints
            across different brands and ranges.
          </p>
        </div>
      </section>

      <section className="text-center py-12 border-t border-border">
        <h2 className="text-2xl font-bold text-foreground">Ready to level up your painting?</h2>
        <p className="mt-3 text-muted-foreground">
          Join Paintpile today. Free accounts include 150 AI credits per month.
        </p>
        <Link
          href="/auth/signup"
          className="mt-6 inline-block rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Create Your Free Account
        </Link>
      </section>
    </div>
  );
}
