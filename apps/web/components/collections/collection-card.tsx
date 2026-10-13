import Link from 'next/link';
import { Lock } from 'lucide-react';

export interface CollectionCardData {
  id: string;
  href: string;
  name: string;
  isPublic: boolean;
  count: number;
  images: string[];
  curator: { name: string; href: string } | null;
}

/** One big cover plus two small ones, Pinterest-board style. */
export function CollectionCard({ card }: { card: CollectionCardData }) {
  const [big, ...small] = card.images;
  return (
    <article>
      <Link href={card.href} className="group grid aspect-[3/2] grid-cols-[2fr_1fr] grid-rows-2 gap-1 overflow-hidden rounded-xl bg-muted">
        <div className="row-span-2 bg-muted">
          {big && <img src={big} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />}
        </div>
        {[0, 1].map((i) => (
          <div key={i} className="bg-muted">
            {small[i] && <img src={small[i]} alt="" loading="lazy" className="h-full w-full object-cover" />}
          </div>
        ))}
      </Link>
      <div className="mt-2">
        <Link href={card.href} className="flex items-center gap-1.5 font-semibold text-foreground hover:text-primary">
          <span className="truncate">{card.name}</span>
          {!card.isPublic && <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-label="Private" />}
        </Link>
        <p className="text-xs text-muted-foreground">
          {card.curator && (
            <>
              Curated by{' '}
              <Link href={card.curator.href} className="font-medium text-foreground hover:underline">{card.curator.name}</Link>
              {' · '}
            </>
          )}
          {card.count} {card.count === 1 ? 'project' : 'projects'}
        </p>
      </div>
    </article>
  );
}
