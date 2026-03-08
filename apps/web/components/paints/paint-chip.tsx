'use client';

interface PaintChipProps {
  color: string;
  name: string;
  className?: string;
}

export function PaintChip({ color, name, className = '' }: PaintChipProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className="inline-block h-3 w-3 rounded-full border border-border flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-sm text-foreground truncate">{name}</span>
    </span>
  );
}
