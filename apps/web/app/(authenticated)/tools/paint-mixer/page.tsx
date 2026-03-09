'use client';

import { Palette } from 'lucide-react';
import { PaintMixer } from '../../../../components/tools/paint-mixer';

export default function PaintMixerPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Paint Mixer</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Describe the color you want and get a mixing recipe using common miniature paints.
      </p>
      <PaintMixer />
    </div>
  );
}
