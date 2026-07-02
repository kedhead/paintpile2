import { Check, Sparkles } from 'lucide-react';
import { AI_BULLETS } from './content';
import { AiCritique } from './mockups/ai-critique';

export function AiCallout() {
  return (
    <section className="relative z-10 px-6 py-16 md:px-12">
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-primary-tint/[.08] to-social/[.08] p-8 shadow-[0_0_60px_rgba(124,58,237,.15)] md:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-vault-blob-purple" />

          <div className="relative flex flex-col gap-8 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary-tint">
                <Sparkles size={12} /> AI-Powered Features
              </div>
              <h2 className="font-bebas text-4xl leading-none tracking-[.04em] text-ink md:text-5xl">
                YOUR PERSONAL
                <br />
                <span className="text-primary-tint">PAINTING COACH</span>
              </h2>
              <p className="mt-4 leading-relaxed text-ink-muted">
                Upload a photo of your miniature and get instant, detailed critique —
                highlighting what works and what to improve. Ask for paint suggestions
                to match any scheme, and generate full step-by-step recipes.
              </p>
              <ul className="mt-5 space-y-2">
                {AI_BULLETS.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-[#c4b5fd]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20">
                      <Check size={11} strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <AiCritique className="w-full flex-shrink-0 md:w-72" />
          </div>
        </div>
      </div>
    </section>
  );
}
