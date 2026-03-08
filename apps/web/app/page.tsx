import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-white">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-5xl font-bold text-foreground">
          Paint<span className="text-primary">pile</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          The community for miniature painters. Share your work, get AI-powered advice, and connect with fellow hobbyists.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary/80 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-md border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-background transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
