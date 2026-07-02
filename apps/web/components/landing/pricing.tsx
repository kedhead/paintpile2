import Link from 'next/link';
import { ArrowRight, Check, Crown, Sparkles } from 'lucide-react';
import { buttonVariants } from '../ui/button';
import { Badge } from '../ui/badge';
import { SectionHeading } from '../ui/section-heading';
import { FREE_FEATURES, PRO_FEATURES } from './content';

export function Pricing() {
  return (
    <section id="pricing" className="relative z-10 scroll-mt-20 px-6 py-20 md:px-12">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          title="SIMPLE, HONEST PRICING"
          subtitle="Start free, upgrade when you're ready."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Free */}
          <div className="rounded-2xl border border-edge bg-surface p-8">
            <div className="mb-1 text-sm font-semibold uppercase tracking-[.08em] text-ink-muted">
              Free
            </div>
            <div className="mb-4 font-bebas text-5xl tracking-[.02em] text-ink">
              $0 <span className="text-xl font-normal text-ink-muted">/ month</span>
            </div>
            <p className="mb-6 text-sm text-ink-muted">
              Everything you need to get started. No credit card required.
            </p>
            <ul className="mb-8 space-y-3">
              {FREE_FEATURES.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-ink-muted">
                    <Check size={11} strokeWidth={3} />
                  </span>
                  <span className="text-[#b0aecf]">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/auth/signup"
              className={buttonVariants({ variant: 'secondary', className: 'w-full' })}
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/15 to-surface to-60% p-8 shadow-[0_0_40px_rgba(124,58,237,.15)]">
            <div className="absolute -top-3.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary px-4 py-1 text-xs font-bold text-white shadow-glow-violet">
              <Sparkles size={11} /> MOST POPULAR
            </div>

            <div className="mb-1 flex items-center gap-2">
              <span className="text-sm font-semibold uppercase tracking-[.08em] text-primary-tint">
                Pro
              </span>
              <Badge variant="pro">
                <Crown size={11} /> PRO
              </Badge>
            </div>
            <div className="mb-4 font-bebas text-5xl tracking-[.02em] text-ink">
              $5 <span className="text-xl font-normal text-primary-tint">/ month</span>
            </div>
            <p className="mb-6 text-sm text-ink-muted">
              For serious painters who want the full toolkit.
            </p>
            <ul className="mb-8 space-y-3">
              {PRO_FEATURES.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/30 text-primary-tint">
                    <Check size={11} strokeWidth={3} />
                  </span>
                  <span className="text-[#c4b5fd]">{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" className={buttonVariants({ className: 'w-full' })}>
              Start Free, Upgrade Anytime <ArrowRight size={15} />
            </Link>
            <p className="mt-2 text-center text-xs text-ink-muted">
              Cancel any time. No contracts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
