import { Card } from '../ui/card';
import { SectionHeading } from '../ui/section-heading';
import { cn } from '../../lib/cn';
import { COMMUNITY_ITEMS, PRINCIPLES } from './content';

export function Community() {
  return (
    <section className="relative z-10 bg-surface/40 px-6 py-20 md:px-12">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          title="A COMMUNITY BUILT ON PASSION"
          subtitle="Connect with painters who share your obsession."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {COMMUNITY_ITEMS.map((item) => (
            <Card key={item.label} className="p-6">
              <div
                className={cn(
                  'mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border',
                  item.iconClasses,
                )}
              >
                <item.icon size={20} />
              </div>
              <h3 className="mb-2 font-bold text-ink">{item.label}</h3>
              <p className="text-sm leading-relaxed text-ink-muted">{item.desc}</p>
            </Card>
          ))}
        </div>

        {/* What we believe */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PRINCIPLES.map((principle) => (
            <div key={principle.quote} className="border-l-2 border-primary/40 pl-4">
              <p className="font-bebas text-2xl leading-tight tracking-[.03em] text-ink">
                &ldquo;{principle.quote}&rdquo;
              </p>
              <p className="mt-1.5 text-sm text-ink-muted">{principle.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
