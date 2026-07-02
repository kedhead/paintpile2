import { Stat } from '../ui/stat';
import { STATS } from './content';

export function StatsBar() {
  return (
    <section className="relative z-10 border-y border-edge bg-surface/60 backdrop-blur-md">
      <div className="mx-auto grid max-w-4xl grid-cols-2 md:grid-cols-4 md:divide-x md:divide-white/5">
        {STATS.map((stat) => (
          <Stat key={stat.label} value={stat.value} label={stat.label} />
        ))}
      </div>
    </section>
  );
}
