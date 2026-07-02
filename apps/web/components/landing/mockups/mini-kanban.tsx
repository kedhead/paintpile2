import { cn } from '../../../lib/cn';
import { WindowFrame } from './window-frame';

interface MiniCard {
  title: string;
  tag: string;
  tagClasses: string;
  progress: number;
  dragging?: boolean;
}

const COLUMNS: { name: string; cards: MiniCard[] }[] = [
  {
    name: 'The Pile',
    cards: [
      { title: 'Necron Warriors ×10', tag: '40k', tagClasses: 'bg-success/15 text-success', progress: 0 },
      { title: 'Ork Boyz ×20', tag: '40k', tagClasses: 'bg-gold/15 text-gold', progress: 0 },
      { title: 'Kruleboyz Gutrippaz', tag: 'AoS', tagClasses: 'bg-social/15 text-social', progress: 0 },
    ],
  },
  {
    name: 'Painting',
    cards: [
      { title: 'Intercessor Squad', tag: '40k', tagClasses: 'bg-primary-soft text-primary-tint', progress: 60, dragging: true },
      { title: 'Redemptor Dreadnought', tag: '40k', tagClasses: 'bg-primary-soft text-primary-tint', progress: 35 },
    ],
  },
  {
    name: 'Done',
    cards: [
      { title: 'Stormcast Liberators', tag: 'AoS', tagClasses: 'bg-gold/15 text-gold', progress: 100 },
      { title: 'Chaos Cultists ×10', tag: '40k', tagClasses: 'bg-success/15 text-success', progress: 100 },
    ],
  },
];

export function MiniKanban({ className }: { className?: string }) {
  return (
    <WindowFrame title="My Projects — Paintpile" className={className}>
      <div className="grid grid-cols-3 gap-3 p-4">
        {COLUMNS.map((col) => (
          <div key={col.name}>
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-[.1em] text-ink-subtle">
                {col.name}
              </span>
              <span className="text-[10px] font-semibold text-ink-subtle">{col.cards.length}</span>
            </div>
            <div className="space-y-2">
              {col.cards.map((card) => (
                <div
                  key={card.title}
                  className={cn(
                    'rounded-lg border border-edge bg-surface-raised p-2.5',
                    card.dragging && 'rotate-2 border-primary/50 shadow-glow-violet',
                  )}
                >
                  <div className="mb-1.5 flex items-center justify-between gap-1">
                    <span className="truncate text-[11px] font-semibold text-ink">{card.title}</span>
                  </div>
                  <span
                    className={cn(
                      'inline-block rounded-full px-1.5 py-px text-[9px] font-bold',
                      card.tagClasses,
                    )}
                  >
                    {card.tag}
                  </span>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        card.progress === 100 ? 'bg-success' : 'bg-primary',
                      )}
                      style={{ width: `${card.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </WindowFrame>
  );
}
