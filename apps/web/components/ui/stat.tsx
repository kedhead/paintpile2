import { cn } from '../../lib/cn';

export function Stat({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-6 text-center', className)}>
      <span className="font-bebas text-3xl tracking-[.04em] text-primary">{value}</span>
      <span className="mt-1 text-xs font-medium text-ink-muted">{label}</span>
    </div>
  );
}
