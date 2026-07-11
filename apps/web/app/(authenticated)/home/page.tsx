'use client';

import Link from 'next/link';
import type { RecordModel } from 'pocketbase';
import {
  Loader2, Layers, Brush, CheckCircle2, TrendingUp,
  FolderOpen, ChefHat, Globe, ArrowRight, Plus,
} from 'lucide-react';
import { useAuth } from '../../../components/auth-provider';
import { useMyProjects, usePublicProjects } from '../../../hooks/use-projects';
import { usePileStats } from '../../../hooks/use-pile';
import { useMyRecipes } from '../../../hooks/use-recipes';
import { ProjectCard } from '../../../components/projects/project-card';
import { relativeTime } from '../../../lib/pb-helpers';

function StatTile({ label, value, icon: Icon }: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href="/pile"
      className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-foreground group-hover:text-primary">{value}</p>
    </Link>
  );
}

function SectionHeader({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-bebas text-2xl tracking-wide text-foreground">{title}</h2>
      <Link href={href} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
        {linkLabel}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

function HomeContent() {
  const { user } = useAuth();
  const stats = usePileStats();
  const myProjects = useMyProjects();
  const myRecipes = useMyRecipes();
  const publicProjects = usePublicProjects();

  const allMyProjects: RecordModel[] = myProjects.data?.pages.flatMap((p) => p.items) || [];
  const inProgress = allMyProjects.filter((p) => p.status === 'in-progress');
  const benchProjects = (inProgress.length > 0 ? inProgress : allMyProjects).slice(0, 6);

  const recipes: RecordModel[] = (myRecipes.data?.pages.flatMap((p) => p.items) || []).slice(0, 3);
  const communityProjects: RecordModel[] = (publicProjects.data?.pages.flatMap((p) => p.items) || []).slice(0, 6);

  const firstName = (user?.name || user?.username || 'Painter').split(' ')[0];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="font-bebas text-4xl tracking-wide text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your bench, your pile, your recipes — all in one place.
        </p>
      </div>

      {/* Pile stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="In the Pile" value={stats.data?.total ?? '—'} icon={Layers} />
        <StatTile label="In Progress" value={stats.data?.inProgress ?? '—'} icon={Brush} />
        <StatTile label="Completed" value={stats.data?.completed ?? '—'} icon={CheckCircle2} />
        <StatTile label="Pile Cleared" value={stats.data ? `${stats.data.completionPercent}%` : '—'} icon={TrendingUp} />
      </div>

      {/* On the bench */}
      <section className="space-y-3">
        <SectionHeader title="On the Bench" href="/projects" linkLabel="All projects" />
        {myProjects.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : benchProjects.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <FolderOpen className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Nothing on the bench yet. Start your first project and track it from primer to done.
            </p>
            <Link
              href="/projects"
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benchProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      {/* Recipe vault */}
      <section className="space-y-3">
        <SectionHeader title="Recipe Vault" href="/recipes" linkLabel="All recipes" />
        {myRecipes.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : recipes.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <ChefHat className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              No recipes saved yet. Never forget how you painted that scheme again.
            </p>
            <Link
              href="/recipes/new"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Create your first recipe
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="group flex items-center gap-3 p-4 first:rounded-t-xl last:rounded-b-xl hover:bg-muted"
              >
                <ChefHat className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                    {recipe.name}
                  </p>
                  {recipe.category && (
                    <p className="text-xs capitalize text-muted-foreground">{recipe.category}</p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{relativeTime(recipe.created)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Community strip */}
      <section className="space-y-3">
        <SectionHeader title="From the Community" href="/feed" linkLabel="Open the Showcase" />
        {publicProjects.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : communityProjects.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <Globe className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No public projects yet — yours could be the first.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {communityProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Sign in to see your bench, pile, and recipes.</p>
        <Link
          href="/auth/login"
          className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return <HomeContent />;
}
