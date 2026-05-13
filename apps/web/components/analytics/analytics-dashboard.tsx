'use client';

import Link from 'next/link';
import { Palette, Boxes, FolderKanban, CheckCircle } from 'lucide-react';
import { useMyInventory } from '../../hooks/use-paints';
import { useMyProjects } from '../../hooks/use-projects';
import { useMyArmies } from '../../hooks/use-armies';
import { useMyRecipes } from '../../hooks/use-recipes';
import { PaintBrandChart } from './paint-brand-chart';
import { ProjectStatusChart } from './project-status-chart';

export function AnalyticsDashboard() {
  const { data: inventory = [] } = useMyInventory();
  const { data: projectsData } = useMyProjects();
  const { data: armiesData } = useMyArmies();
  const { data: recipesData } = useMyRecipes();

  const projects = projectsData?.pages.flatMap((p) => p.items) || [];
  const armies = armiesData?.pages.flatMap((p) => p.items) || [];
  const recipes = recipesData?.pages.flatMap((p) => p.items) || [];

  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const isNewUser = inventory.length === 0 && projects.length === 0;

  const kpis = [
    { label: 'Paints Owned', value: inventory.length, icon: Palette, color: 'text-purple-400' },
    { label: 'Projects', value: projects.length, icon: FolderKanban, color: 'text-blue-400' },
    { label: 'Completed', value: completedCount, icon: CheckCircle, color: 'text-green-400' },
    { label: 'Armies', value: armies.length, icon: Boxes, color: 'text-amber-400' },
  ];

  const checklist = [
    { label: 'Create your account', done: true, href: null },
    { label: 'Create your first project', done: projects.length > 0, href: '/projects' },
    { label: 'Add paints to your inventory', done: inventory.length > 0, href: '/paints' },
    { label: 'Follow someone on the feed', done: false, href: '/feed?tab=people' },
    { label: 'Join a community group', done: false, href: '/groups' },
  ];

  if (isNewUser) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-1 text-base font-bold text-foreground">Getting Started</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Complete these steps to make the most of Paintpile.
        </p>
        <ul className="space-y-3">
          {checklist.map((item) => (
            <li key={item.label} className="flex items-center gap-3">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  item.done
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-white/5 text-muted-foreground'
                }`}
              >
                {item.done ? '✓' : '·'}
              </span>
              {item.href && !item.done ? (
                <Link href={item.href} className="text-sm font-medium text-primary hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`text-sm ${
                    item.done ? 'text-muted-foreground line-through' : 'font-medium text-foreground'
                  }`}
                >
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Paints by Brand</h3>
          <PaintBrandChart inventory={inventory} />
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Project Status</h3>
          <ProjectStatusChart projects={projects} />
        </div>
      </div>
    </div>
  );
}
