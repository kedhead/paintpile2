'use client';

import { useState } from 'react';
import { Sparkles, Palette, BookOpen, ChefHat, ZoomIn, Paintbrush, Loader2 } from 'lucide-react';
import { useAICritique, usePaintSuggestions, useTechniqueAdvisor, useRecipeGeneration, useUpscale } from '../../hooks/use-ai';
import { CritiqueCard } from './critique-card';
import { PaintSuggestionsPanel } from './paint-suggestions-panel';
import { TechniqueAdvisorPanel } from './technique-advisor-panel';
import { RecipeResult } from './recipe-result';
import { RecolorDialog } from './recolor-dialog';
import { ShareScoreButton } from '../brag-board/share-score-button';
import { SaveRecolorToDiaryButton } from './save-recolor-to-diary-button';

interface AIActionBarProps {
  projectId: string;
  projectName: string;
  imageUrl: string | null;
}

type AIPanel = 'critique' | 'suggestions' | 'technique' | 'recipe' | null;

export function AIActionBar({ projectId, projectName, imageUrl }: AIActionBarProps) {
  const [activePanel, setActivePanel] = useState<AIPanel>(null);
  const [showRecolor, setShowRecolor] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<Record<string, any>>({});
  const [upscaleResult, setUpscaleResult] = useState<string | null>(null);
  const [recolorResult, setRecolorResult] = useState<string | null>(null);

  const critique = useAICritique();
  const paintSuggestions = usePaintSuggestions();
  const techniqueAdvisor = useTechniqueAdvisor();
  const recipeGeneration = useRecipeGeneration();
  const upscale = useUpscale();

  if (!imageUrl) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background p-4 text-center">
        <Sparkles className="mx-auto h-5 w-5 text-muted-foreground" />
        <p className="mt-1 text-sm text-muted-foreground">Upload a cover photo to unlock AI features</p>
      </div>
    );
  }

  const isAnyLoading =
    critique.isPending || paintSuggestions.isPending || techniqueAdvisor.isPending ||
    recipeGeneration.isPending || upscale.isPending;

  const handleAction = async (action: 'critique' | 'suggestions' | 'technique' | 'recipe') => {
    if (!imageUrl) return;

    if (action === activePanel && results[action]) {
      setActivePanel(null);
      return;
    }

    setActivePanel(action);

    if (results[action]) return;

    try {
      switch (action) {
        case 'critique': {
          const res = await critique.mutateAsync({ projectId, imageUrl });
          setResults((prev) => ({ ...prev, critique: res.data.critique }));
          break;
        }
        case 'suggestions': {
          const res = await paintSuggestions.mutateAsync({ imageUrl });
          setResults((prev) => ({ ...prev, suggestions: res.data }));
          break;
        }
        case 'technique': {
          const res = await techniqueAdvisor.mutateAsync({ imageUrl });
          setResults((prev) => ({ ...prev, technique: res.data }));
          break;
        }
        case 'recipe': {
          const res = await recipeGeneration.mutateAsync({ imageUrl });
          setResults((prev) => ({ ...prev, recipe: res.data.recipe }));
          break;
        }
      }
    } catch (error) {
      console.error(`AI ${action} error:`, error);
    }
  };

  const handleUpscale = async () => {
    if (!imageUrl) return;
    try {
      const res = await upscale.mutateAsync({ imageUrl });
      setUpscaleResult(res.data.imageUrl);
    } catch (error) {
      console.error('Upscale error:', error);
    }
  };

  const actions = [
    { key: 'critique' as const, label: 'Critique', icon: Sparkles, credits: 8, loading: critique.isPending },
    { key: 'suggestions' as const, label: 'Paints', icon: Palette, credits: 8, loading: paintSuggestions.isPending },
    { key: 'technique' as const, label: 'Technique', icon: BookOpen, credits: 8, loading: techniqueAdvisor.isPending },
    { key: 'recipe' as const, label: 'Recipe', icon: ChefHat, credits: 25, loading: recipeGeneration.isPending },
  ];

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={() => handleAction(action.key)}
            disabled={isAnyLoading}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
              activePanel === action.key
                ? 'border-primary-300 bg-primary/10 text-primary'
                : 'border-border bg-card text-foreground hover:bg-background'
            }`}
          >
            {action.loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <action.icon className="h-3.5 w-3.5" />
            )}
            {action.label}
            <span className="text-muted-foreground">({action.credits})</span>
          </button>
        ))}

        <button
          onClick={handleUpscale}
          disabled={isAnyLoading || upscale.isPending}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-background disabled:opacity-50"
        >
          {upscale.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ZoomIn className="h-3.5 w-3.5" />}
          Upscale
          <span className="text-muted-foreground">(10)</span>
        </button>

        <button
          onClick={() => setShowRecolor(true)}
          disabled={isAnyLoading}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-background disabled:opacity-50"
        >
          <Paintbrush className="h-3.5 w-3.5" />
          Recolor
          <span className="text-muted-foreground">(20)</span>
        </button>
      </div>

      {/* Results Panels */}
      {activePanel === 'critique' && results.critique && (
        <div className="space-y-3">
          <div id={`critique-card-${projectId}`}>
            <CritiqueCard critique={results.critique} />
          </div>
          <ShareScoreButton
            projectId={projectId}
            projectName={projectName}
            critique={results.critique}
          />
        </div>
      )}

      {activePanel === 'suggestions' && results.suggestions && (
        <PaintSuggestionsPanel
          suggestions={results.suggestions.suggestions || []}
          overallScheme={results.suggestions.overall_scheme}
          paletteType={results.suggestions.palette_type}
        />
      )}

      {activePanel === 'technique' && results.technique && (
        <TechniqueAdvisorPanel
          techniques={results.technique.techniques || []}
          nextSteps={results.technique.next_steps}
          skillLevel={results.technique.skill_level}
        />
      )}

      {activePanel === 'recipe' && results.recipe && (
        <RecipeResult recipe={results.recipe} />
      )}

      {/* Upscale Result */}
      {upscaleResult && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold text-foreground">Upscaled Image</h3>
          <a href={upscaleResult} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
            Open full resolution
          </a>
          <img src={upscaleResult} alt="Upscaled" className="mt-2 w-full rounded-lg" />
        </div>
      )}

      {/* Recolor Result */}
      {recolorResult && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="mb-2 text-sm font-semibold text-foreground">Recolored Image</h3>
          <img src={recolorResult} alt="Recolored" className="w-full rounded-lg" />
          <SaveRecolorToDiaryButton
            projectName={projectName}
            recolorImageUrl={recolorResult}
          />
        </div>
      )}

      {/* Recolor Dialog */}
      {showRecolor && (
        <RecolorDialog
          imageUrl={imageUrl}
          onClose={() => setShowRecolor(false)}
          onResult={setRecolorResult}
        />
      )}
    </div>
  );
}
