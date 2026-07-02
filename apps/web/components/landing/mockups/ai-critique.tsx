import { Paintbrush, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/cn';

const SKILL_CHIPS = [
  { label: 'Edge highlights', tone: 'bg-success/15 text-success' },
  { label: 'Thin coats', tone: 'bg-success/15 text-success' },
  { label: 'Blending', tone: 'bg-gold/15 text-gold' },
];

export function AiCritique({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-edge bg-surface-deep p-5 shadow-vault-lg',
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={13} className="text-primary-tint" />
        <span className="text-xs font-bold text-ink">AI Critique</span>
        <span className="ml-auto rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary-tint">
          ~10s
        </span>
      </div>

      {/* Uploaded-photo placeholder */}
      <div className="mb-3 flex h-28 items-center justify-center rounded-xl border border-primary/20 bg-gradient-to-br from-primary/15 via-surface-raised to-surface-alt">
        <Paintbrush size={26} className="text-primary-tint/60" />
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {SKILL_CHIPS.map((chip) => (
          <span
            key={chip.label}
            className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', chip.tone)}
          >
            {chip.label}
          </span>
        ))}
      </div>

      <p className="mb-4 text-[11px] leading-relaxed text-ink-muted">
        &ldquo;Clean edge highlights on the pauldrons and crisp basing. Try thinning
        your glazes on the cloak to smooth the blend transitions&hellip;&rdquo;
      </p>

      <div className="flex gap-2">
        <div className="flex-1 rounded-lg bg-primary-soft py-2 text-center text-xs font-semibold text-primary-tint">
          Critique
        </div>
        <div className="flex-1 rounded-lg bg-surface-raised py-2 text-center text-xs font-semibold text-ink-muted">
          Recipe
        </div>
      </div>
    </div>
  );
}
