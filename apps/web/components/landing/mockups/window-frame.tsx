import { type ReactNode } from 'react';
import { cn } from '../../../lib/cn';

/** macOS-style window chrome wrapper used by the landing mockups */
export function WindowFrame({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-edge bg-surface-deep shadow-vault-lg',
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-edge px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-xs font-semibold text-ink-muted">{title}</span>
      </div>
      {children}
    </div>
  );
}
