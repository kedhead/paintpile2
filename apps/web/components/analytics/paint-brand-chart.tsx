'use client';

import type { RecordModel } from 'pocketbase';

interface PaintBrandChartProps {
  inventory: RecordModel[];
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

export function PaintBrandChart({ inventory }: PaintBrandChartProps) {
  // Count paints by brand
  const brandCounts: Record<string, number> = {};
  inventory.forEach((item) => {
    const brand = item.expand?.paint?.brand || 'Unknown';
    brandCounts[brand] = (brandCounts[brand] || 0) + 1;
  });

  const entries = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  if (entries.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Add paints to see brand breakdown</p>;
  }

  return (
    <div className="space-y-2">
      {entries.map(([brand, count], i) => {
        const pct = total > 0 ? (count / total) * 100 : 0;
        const color = COLORS[i % COLORS.length];
        return (
          <div key={brand} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="min-w-0 flex-1 truncate text-xs text-foreground">{brand}</span>
            <div className="w-24">
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
