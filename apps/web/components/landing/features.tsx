import { Card } from '../ui/card';
import { SectionHeading } from '../ui/section-heading';
import { cn } from '../../lib/cn';
import { FEATURES } from './content';

export function Features() {
  return (
    <section id="features" className="relative z-10 scroll-mt-20 px-6 py-20 md:px-12">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          title="EVERYTHING YOU NEED TO LEVEL UP"
          subtitle="Built by painters, for painters — every feature comes from the community."
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.label} interactive className="p-5">
              <div
                className={cn(
                  'mb-3 flex h-10 w-10 items-center justify-center rounded-xl border',
                  feature.iconClasses,
                )}
              >
                <feature.icon size={18} />
              </div>
              <h3 className="mb-1.5 text-sm font-bold text-ink">{feature.label}</h3>
              <p className="text-xs leading-relaxed text-ink-muted">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
