'use client';

import { Loader2, Palette, Boxes, FolderKanban, CheckCircle } from 'lucide-react';
import { useMyInventory, usePaintDatabase } from '../../hooks/use-paints';
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

  const kpis = [
    { label: 'Paints Owned', value: inventory.length, icon: Palette, color: 'text-purple-400' },
    { label: 'Projects', value: projects.length, icon: FolderKanban, color: 'text-blue-400' },
    { label: 'Completed', value: completedCount, icon: CheckCircle, color: 'text-green-400' },
    { label: 'Armies', value: armies.length, icon: Boxes, color: 'text-amber-400' },
  ];

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
