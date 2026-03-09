'use client';

import { Bookmark, Loader2 } from 'lucide-react';
import { useIsSaved, useSaveRecipe, useUnsaveRecipe } from '../../hooks/use-saved-recipes';
import { useAuth } from '../auth-provider';

interface SaveRecipeButtonProps {
  recipeId: string;
}

export function SaveRecipeButton({ recipeId }: SaveRecipeButtonProps) {
  const { user } = useAuth();
  const { data: isSaved = false } = useIsSaved(recipeId);
  const saveRecipe = useSaveRecipe();
  const unsaveRecipe = useUnsaveRecipe();
  const isPending = saveRecipe.isPending || unsaveRecipe.isPending;

  if (!user) return null;

  const handleToggle = () => {
    if (isSaved) {
      unsaveRecipe.mutate(recipeId);
    } else {
      saveRecipe.mutate(recipeId);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        isSaved
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
      title={isSaved ? 'Remove bookmark' : 'Bookmark recipe'}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-primary' : ''}`} />
      )}
    </button>
  );
}
