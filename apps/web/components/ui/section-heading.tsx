import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function SectionHeading({
  title,
  subtitle,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-12 text-center', className)}>
      <h2 className="font-bebas text-4xl tracking-[.04em] text-ink md:text-5xl">{title}</h2>
      {subtitle && <p className="mt-3 text-ink-muted">{subtitle}</p>}
    </div>
  );
}
