import type { Metadata } from 'next';
import Link from 'next/link';
import { ChefHat, Clock, Layers, ArrowRight, User, Lightbulb } from 'lucide-react';
import PocketBase from 'pocketbase';
import { getDisplayName } from '@paintpile/shared';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thepaintpile.com';

function getImageUrl(collectionId: string, recordId: string, filename: string) {
  return `${PB_URL}/api/files/${collectionId}/${recordId}/${filename}`;
}

function parseJSON<T>(value: unknown, fallback: T): T {
  if (Array.isArray(value)) return value as T;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

interface Ingredient {
  paint_name: string;
  paint_color: string;
  role: string;
  paint_brand?: string;
}

interface Step {
  id?: string;
  title?: string;
  instruction: string;
  estimated_time: number;
  technique?: string;
  paint_indices?: number[];
  tips?: string[];
  video_url?: string;
}

async function getRecipe(recipeId: string) {
  try {
    const pb = new PocketBase(PB_URL);
    return await pb.collection('recipes').getOne(recipeId, { expand: 'user' });
  } catch {
    return null;
  }
}

async function getStepMedia(recipeId: string) {
  try {
    const pb = new PocketBase(PB_URL);
    const records = await pb.collection('recipe_step_media').getFullList({
      filter: `recipe="${recipeId}"`,
      sort: 'sort_order',
    });
    return records;
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ recipeId: string }>;
}): Promise<Metadata> {
  const { recipeId } = await params;
  const recipe = await getRecipe(recipeId);

  if (!recipe) {
    return { title: 'Recipe Not Found - Paintpile' };
  }

  const userName = getDisplayName(recipe.expand?.user, 'A painter');
  const title = `${recipe.name} by ${userName} - Paintpile`;
  const description =
    recipe.description || `Check out this painting recipe on Paintpile!`;
  const url = `${SITE_URL}/share/recipe/${recipeId}`;

  const images: string[] = [];
  if (recipe.cover_image) {
    images.push(getImageUrl(recipe.collectionId, recipe.id, recipe.cover_image));
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Paintpile',
      type: 'article',
      images: images.length > 0 ? images : undefined,
    },
    twitter: {
      card: images.length > 0 ? 'summary_large_image' : 'summary',
      title,
      description,
      images: images.length > 0 ? images : undefined,
    },
  };
}

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner: 'bg-green-500/20 text-green-400',
  intermediate: 'bg-yellow-500/20 text-yellow-400',
  advanced: 'bg-red-500/20 text-red-400',
};

export default async function ShareRecipePage({
  params,
}: {
  params: Promise<{ recipeId: string }>;
}) {
  const { recipeId } = await params;
  const recipe = await getRecipe(recipeId);

  if (!recipe) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold text-foreground">Recipe Not Found</h1>
          <p className="text-muted-foreground">
            This recipe may have been removed or set to private.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
          >
            Go to Paintpile
          </Link>
        </div>
      </div>
    );
  }

  if (!recipe.is_public) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold text-foreground">Private Recipe</h1>
          <p className="text-muted-foreground">
            This recipe is private. Sign in to view it.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const userName = getDisplayName(recipe.expand?.user, 'A painter');
  const coverUrl = recipe.cover_image
    ? getImageUrl(recipe.collectionId, recipe.id, recipe.cover_image)
    : null;
  const ingredients = parseJSON<Ingredient[]>(recipe.ingredients, []);
  const steps = parseJSON<Step[]>(recipe.steps, []);
  const techniques = parseJSON<string[]>(recipe.techniques, []);
  const difficulty = recipe.difficulty || 'beginner';
  const totalTime = steps.reduce((sum, s) => sum + (s.estimated_time || 0), 0);

  // Fetch step media
  const mediaRecords = await getStepMedia(recipeId);
  const mediaByStep: Record<string, typeof mediaRecords> = {};
  mediaRecords.forEach((m) => {
    const sid = m.step_id;
    if (!mediaByStep[sid]) mediaByStep[sid] = [];
    mediaByStep[sid].push(m);
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Top banner */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center">
            <img src="/logosmall.png" alt="Paintpile" className="h-9 w-auto" />
          </Link>
          <Link
            href="/auth/signup"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
          >
            Join Paintpile
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Recipe content */}
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {/* Cover image */}
        {coverUrl && (
          <div className="overflow-hidden rounded-xl bg-card">
            <img
              src={coverUrl}
              alt={recipe.name}
              className="w-full object-contain"
            />
          </div>
        )}

        {/* Title & Author */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{recipe.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {userName}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${DIFFICULTY_STYLES[difficulty] || ''}`}
            >
              {difficulty}
            </span>
            {recipe.category && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                {recipe.category.replace(/-/g, ' ')}
              </span>
            )}
            {totalTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {totalTime} min
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {recipe.description && (
          <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
            {recipe.description}
          </p>
        )}

        {/* Techniques */}
        {techniques.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {techniques.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium capitalize text-primary"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">Ingredients</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {ingredients.map((ing, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
                >
                  <span
                    className="h-5 w-5 shrink-0 rounded-full border border-border"
                    style={{ backgroundColor: ing.paint_color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {ing.paint_name}
                    </p>
                    {ing.paint_brand && (
                      <p className="text-xs text-muted-foreground truncate">{ing.paint_brand}</p>
                    )}
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground capitalize">
                    {ing.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">Steps</h2>
            <ol className="space-y-4">
              {steps.map((step, i) => {
                const stepMedia = mediaByStep[step.id || ''] || [];
                return (
                  <li
                    key={i}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <div className="flex-1 space-y-3">
                        {step.title && (
                          <h3 className="text-sm font-semibold text-foreground">
                            {step.title}
                          </h3>
                        )}
                        <p className="whitespace-pre-wrap text-sm text-foreground">
                          {step.instruction}
                        </p>

                        {/* Step images */}
                        {stepMedia.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {stepMedia.map((m) => (
                              <img
                                key={m.id}
                                src={getImageUrl(m.collectionId, m.id, m.image)}
                                alt={m.caption || ''}
                                className="h-40 w-auto rounded-lg object-cover sm:h-52"
                                loading="lazy"
                              />
                            ))}
                          </div>
                        )}

                        {/* Technique badge */}
                        {step.technique && (
                          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary">
                            {step.technique}
                          </span>
                        )}

                        {/* Paint swatches */}
                        {step.paint_indices && step.paint_indices.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {step.paint_indices.map((idx) => {
                              const ing = ingredients[idx];
                              if (!ing) return null;
                              return (
                                <span
                                  key={idx}
                                  className="flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                                >
                                  <span
                                    className="h-2.5 w-2.5 rounded-full border border-border"
                                    style={{ backgroundColor: ing.paint_color }}
                                  />
                                  {ing.paint_name}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Tips */}
                        {step.tips && step.tips.length > 0 && (
                          <div className="flex gap-2 rounded-md border border-yellow-500/20 bg-yellow-900/10 px-3 py-2">
                            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-400" />
                            <div className="space-y-1">
                              {step.tips.map((tip, ti) => (
                                <p key={ti} className="text-xs text-yellow-300">
                                  {tip}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Time */}
                        {step.estimated_time > 0 && (
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            ~{step.estimated_time} min
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
          <h3 className="text-lg font-bold text-foreground">
            Want to create and share your own recipes?
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Join Paintpile to build painting tutorials, track your projects, and
            connect with fellow painters.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/auth/signup"
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary/80"
            >
              Sign Up Free
            </Link>
            <Link
              href="/auth/login"
              className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
