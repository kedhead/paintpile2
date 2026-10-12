'use client';

import { use } from 'react';
import { Loader2 } from 'lucide-react';
import { useRecipe } from '../../../../../hooks/use-recipes';
import { RecipeForm } from '../../../../../components/recipes/recipe-form';

export default function EditRecipePage({ params }: { params: Promise<{ recipeId: string }> }) {
  const { recipeId } = use(params);
  const { data: recipe, isLoading } = useRecipe(recipeId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Recipe not found</p>
      </div>
    );
  }

  return <RecipeForm recipe={recipe} />;
}
