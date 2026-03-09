'use client';

import Link from 'next/link';
import type { RecordModel } from 'pocketbase';
import { ChefHat, Trash2, Loader2, Plus } from 'lucide-react';
import { useProjectRecipes, useUnlinkRecipe } from '../../hooks/use-project-recipes';

interface ProjectRecipesListProps {
  projectId: string;
  isOwner: boolean;
}

export function ProjectRecipesList({ projectId, isOwner }: ProjectRecipesListProps) {
  const { data: linked = [], isLoading } = useProjectRecipes(projectId);
  const unlinkRecipe = useUnlinkRecipe();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (linked.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center">
        <ChefHat className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          {isOwner ? 'Link recipes used in this project' : 'No recipes linked yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {linked.map((pr: RecordModel) => {
        const recipe = pr.expand?.recipe;
        return (
          <div key={pr.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
            <ChefHat className="h-4 w-4 flex-shrink-0 text-orange-400" />
            <div className="min-w-0 flex-1">
              <Link
                href={`/recipes/${recipe?.id || pr.recipe}`}
                className="text-sm font-medium text-foreground hover:text-primary"
              >
                {recipe?.name || 'Recipe'}
              </Link>
              {pr.applied_to && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {pr.applied_to}
                </span>
              )}
              {pr.notes && <p className="mt-0.5 text-xs text-muted-foreground">{pr.notes}</p>}
            </div>
            {isOwner && (
              <button
                onClick={() => unlinkRecipe.mutate({ id: pr.id, projectId })}
                className="text-muted-foreground hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
