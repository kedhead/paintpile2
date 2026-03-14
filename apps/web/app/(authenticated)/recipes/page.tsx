'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChefHat, Plus } from 'lucide-react';
import { useMyRecipes, usePublicRecipes } from '../../../hooks/use-recipes';
import { RecipeList } from '../../../components/recipes/recipe-list';

export default function RecipesPage() {
  const [tab, setTab] = useState<'my' | 'browse'>('my');
  const myRecipes = useMyRecipes();
  const publicRecipes = usePublicRecipes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Recipes</h1>
        </div>
        <Link
          href="/recipes/new"
          className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
        >
          <Plus className="h-4 w-4" />
          New Recipe
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => setTab('my')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === 'my' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          My Recipes
        </button>
        <button
          onClick={() => setTab('browse')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === 'browse' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Browse
        </button>
      </div>

      {tab === 'my' ? (
        <RecipeList
          query={myRecipes}
          emptyMessage="No recipes yet. Create your first paint recipe!"
        />
      ) : (
        <RecipeList
          query={publicRecipes}
          emptyMessage="No public recipes to browse yet."
        />
      )}
    </div>
  );
}
