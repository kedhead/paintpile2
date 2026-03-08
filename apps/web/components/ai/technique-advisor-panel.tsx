'use client';

interface Technique {
  name: string;
  description: string;
  steps: string[];
  difficulty: string;
  area: string;
}

interface TechniqueAdvisorPanelProps {
  techniques: Technique[];
  nextSteps?: string;
  skillLevel?: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-purple-100 text-purple-700',
  expert: 'bg-red-100 text-red-700',
};

export function TechniqueAdvisorPanel({ techniques, nextSteps, skillLevel }: TechniqueAdvisorPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Technique Advice</h3>
        {skillLevel && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLORS[skillLevel] || 'bg-muted text-foreground'}`}>
            {skillLevel}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {techniques.map((t, i) => (
          <div key={i} className="rounded-md border border-border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{t.name}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${DIFFICULTY_COLORS[t.difficulty] || 'bg-muted text-muted-foreground'}`}>
                {t.difficulty}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
            <p className="mt-1 text-xs text-muted-foreground">Apply to: {t.area}</p>
            <ol className="mt-2 list-inside list-decimal space-y-0.5">
              {t.steps.map((step, j) => (
                <li key={j} className="text-xs text-muted-foreground">{step}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      {nextSteps && (
        <div className="rounded-md bg-blue-50 p-3">
          <p className="text-xs font-medium text-blue-800">Next Steps</p>
          <p className="mt-0.5 text-xs text-blue-700">{nextSteps}</p>
        </div>
      )}
    </div>
  );
}
