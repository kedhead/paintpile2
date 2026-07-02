import { Check } from 'lucide-react';
import { PaintSwatches } from './mockups/paint-swatches';

const PAINT_POINTS = [
  'Citadel, Vallejo, Army Painter and more — one searchable inventory',
  'Mark what you own, wishlist what you need',
  'Find equivalents across brands before you re-buy a colour you already have',
];

export function PaintsStrip() {
  return (
    <section className="relative z-10 px-6 py-20 md:px-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 md:flex-row md:gap-16">
        <PaintSwatches className="w-full max-w-sm -rotate-1 md:w-80 md:shrink-0" />
        <div className="flex-1 text-center md:text-left">
          <h2 className="font-bebas text-4xl leading-none tracking-[.04em] text-ink md:text-5xl">
            BUILT AROUND
            <br />
            <span className="text-success">YOUR PAINTS</span>
          </h2>
          <p className="mt-4 leading-relaxed text-ink-muted">
            A database of 4,700+ paints means your collection lives in Paintpile,
            not on a crumpled list in your hobby drawer. Know exactly what you have
            before you walk into the store.
          </p>
          <ul className="mt-5 space-y-2 text-left">
            {PAINT_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-ink-muted">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                  <Check size={11} strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
