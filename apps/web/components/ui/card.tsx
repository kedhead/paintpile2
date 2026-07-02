import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds hover border/glow for clickable cards */
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { interactive = false, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-edge bg-surface shadow-vault',
        interactive &&
          'transition-all hover:border-primary/30 hover:shadow-[0_0_24px_rgba(124,58,237,.10),0_2px_12px_rgba(0,0,0,.5)]',
        className,
      )}
      {...props}
    />
  );
});
