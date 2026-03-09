'use client';

import { Crosshair } from 'lucide-react';
import { ColorMatcher } from '../../../../components/tools/color-matcher';

export default function ColorMatcherPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Crosshair className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Color Matcher</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Upload a photo and click any pixel to find the closest matching miniature paints.
      </p>
      <ColorMatcher />
    </div>
  );
}
