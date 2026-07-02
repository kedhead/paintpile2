import { Check, Search } from 'lucide-react';
import { cn } from '../../../lib/cn';

const PAINTS = [
  { name: 'Mephiston Red', line: 'Citadel · Base', hex: '#921317', owned: true },
  { name: 'Macragge Blue', line: 'Citadel · Base', hex: '#0d407f', owned: true },
  { name: 'Retributor Armour', line: 'Citadel · Base', hex: '#c39e81', owned: true },
  { name: 'Caliban Green', line: 'Citadel · Base', hex: '#00401a', owned: false },
  { name: 'Averland Sunset', line: 'Citadel · Base', hex: '#fbb81c', owned: true },
  { name: 'Kantor Blue', line: 'Citadel · Base', hex: '#002c5f', owned: false },
  { name: 'Screamer Pink', line: 'Citadel · Base', hex: '#7c1645', owned: true },
  { name: 'Corax White', line: 'Citadel · Base', hex: '#f4f5f4', owned: false },
];

export function PaintSwatches({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-edge bg-surface-deep p-4 shadow-vault-lg',
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold text-ink">My Paints</span>
        <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary-tint">
          4,712 in database
        </span>
      </div>
      <div className="mb-3 flex items-center gap-2 rounded-full bg-surface-alt px-3 py-1.5">
        <Search size={11} className="text-ink-subtle" />
        <span className="text-[11px] text-ink-subtle">Search paints…</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {PAINTS.map((paint) => (
          <div
            key={paint.name}
            className="flex items-center gap-2 rounded-lg border border-edge bg-surface-raised p-1.5"
          >
            <span
              className="relative h-6 w-6 shrink-0 rounded-md border border-white/10"
              style={{ background: paint.hex }}
            >
              {paint.owned && (
                <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-success">
                  <Check size={8} strokeWidth={4} className="text-black" />
                </span>
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[10px] font-semibold leading-tight text-ink">
                {paint.name}
              </span>
              <span className="block truncate text-[9px] leading-tight text-ink-subtle">
                {paint.line}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
