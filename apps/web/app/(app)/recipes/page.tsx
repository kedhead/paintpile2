'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChefHat, Plus, BookOpen } from 'lucide-react';
import { useAuth } from '../../../components/auth-provider';
import { LoginPrompt } from '../../../components/auth/login-prompt';
import { useMyRecipes, usePublicRecipes } from '../../../hooks/use-recipes';
import { RecipeList } from '../../../components/recipes/recipe-list';
import { usePalettePosts } from '../../../hooks/use-palette-posts';
import { PalettePostCard } from '../../../components/recipes/palette-post-card';

function TutorialsList() {
  const palettePosts = usePalettePosts();

  const posts = palettePosts.data?.pages.flatMap((p) => p.items) ?? [];

  if (palettePosts.isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <BookOpen className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No tutorials yet. Create one from the Palette Post tool!</p>
        <Link
          href="/palette-post"
          className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
        >
          <Plus className="h-4 w-4" />
          Create Tutorial
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PalettePostCard key={post.id} post={post} />
        ))}
      </div>
      {palettePosts.hasNextPage && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => palettePosts.fetchNextPage()}
            disabled={palettePosts.isFetchingNextPage}
            className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            {palettePosts.isFetchingNextPage ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function RecipesPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'my' | 'browse' | 'tutorials'>(user ? 'my' : 'browse');
  const myRecipes = useMyRecipes();
  const publicRecipes = usePublicRecipes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Recipes</h1>
        </div>
        {user ? (
          <Link
            href="/recipes/new"
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
          >
            <Plus className="h-4 w-4" />
            New Recipe
          </Link>
        ) : (
          <LoginPrompt action="create a recipe">
            {(open) => (
              <button
                onClick={open}
                className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
              >
                <Plus className="h-4 w-4" />
                New Recipe
              </button>
            )}
          </LoginPrompt>
        )}
      </div>

      {/* Tabs */}
      {user && (
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
            onClick={() => setTab('tutorials')}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === 'tutorials' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tutorials
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
      )}

      {tab === 'my' ? (
        <RecipeList
          query={myRecipes}
          emptyMessage="No recipes yet. Create your first paint recipe!"
        />
      ) : tab === 'tutorials' ? (
        <TutorialsList />
      ) : (
        <RecipeList
          query={publicRecipes}
          emptyMessage="No public recipes to browse yet."
        />
      )}
    </div>
  );
}
