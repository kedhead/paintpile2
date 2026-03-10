import Link from 'next/link';
import {
  Palette, Camera, Brain, Users, Award, ChefHat,
  MessageSquare, BarChart3, Share2, Zap, Shield, Sparkles,
} from 'lucide-react';

const features = [
  {
    icon: Camera,
    title: 'Project Tracking',
    description: 'Document your miniature painting journey from primed to finished with photos, timelines, and progress tracking.',
  },
  {
    icon: Brain,
    title: 'AI Critique',
    description: 'Get instant AI-powered feedback on your painting technique, with scores, grades, and improvement suggestions.',
  },
  {
    icon: Palette,
    title: 'Paint Library',
    description: '4,700+ paints from 14 brands. Track your inventory, browse paint sets, and never buy duplicates.',
  },
  {
    icon: ChefHat,
    title: 'Paint Recipes',
    description: 'Create and share step-by-step paint recipes so others can replicate your color schemes.',
  },
  {
    icon: Users,
    title: 'Groups & Chat',
    description: 'Create or join painting groups with text and voice channels, image sharing, and real-time messaging.',
  },
  {
    icon: Award,
    title: 'Brag Board',
    description: 'Share your AI critique scores with the community and see how others are progressing.',
  },
  {
    icon: Share2,
    title: 'Social Sharing',
    description: 'Share your projects to Instagram, X, Facebook, and Reddit with beautiful preview cards.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'See your painting stats — paints used, projects completed, and brand breakdowns.',
  },
  {
    icon: Sparkles,
    title: 'AI Color Matching',
    description: 'Sample colors from any reference image and find the closest matching paints in your collection.',
  },
  {
    icon: MessageSquare,
    title: 'Community Feed',
    description: 'Discover what other painters are working on, like and comment on projects.',
  },
  {
    icon: Zap,
    title: 'Quick Paint Sets',
    description: 'Browse 139 official paint sets and add entire sets to your inventory with one click.',
  },
  {
    icon: Shield,
    title: 'Free to Use',
    description: 'No paywalls, no ads. Built by painters, for painters. Sign up and start tracking today.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-5xl px-4 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Paint<span className="text-primary">pile</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            The community for miniature painters. Track your projects, get AI-powered critiques,
            manage your paint collection, and connect with fellow hobbyists.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg hover:bg-primary/80 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-8 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mx-auto max-w-5xl px-4 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">Everything you need to level up your painting</h2>
          <p className="mt-2 text-muted-foreground">All the tools miniature painters have been asking for, in one place.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-xl border border-primary/30 bg-primary/5 p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground">Ready to start painting smarter?</h3>
          <p className="mt-2 text-muted-foreground">
            Join the growing community of miniature painters on Paintpile.
          </p>
          <Link
            href="/auth/signup"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary/80 transition-colors"
          >
            Create Your Free Account
          </Link>
        </div>
      </div>
    </div>
  );
}
