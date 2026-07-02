import { type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type BadgeVariant = 'default' | 'pro' | 'success' | 'primary' | 'outline';

const VARIANTS: Record<BadgeVariant, string> = {
  default: 'bg-white/10 text-ink-muted',
  pro: 'bg-gold-soft text-gold',
  success: 'bg-success/15 text-success',
  primary: 'bg-primary-soft text-primary-tint',
  outline: 'border border-edge-strong text-ink-muted',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
