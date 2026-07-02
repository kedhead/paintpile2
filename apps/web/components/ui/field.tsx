import { useId, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function Field({
  label,
  error,
  hint,
  htmlFor,
  className,
  children,
}: {
  label: string;
  error?: string | null;
  hint?: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}) {
  const autoId = useId();
  const id = htmlFor ?? autoId;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold uppercase tracking-[.08em] text-ink-muted"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-subtle">{hint}</p>
      ) : null}
    </div>
  );
}
