import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="mt-4 text-lg text-foreground">Page not found</p>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/feed"
          className="mt-6 inline-block rounded-md bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary/80"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
