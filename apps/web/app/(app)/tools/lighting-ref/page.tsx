'use client';

import { Sun } from 'lucide-react';
import { LightingRefTool } from '../../../../components/tools/lighting-ref-tool';

export default function LightingRefPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Sun className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lighting Reference</h1>
          <p className="text-sm text-muted-foreground">
            Upload a photo and simulate multi-light setups with real-time depth-aware shading
          </p>
        </div>
      </div>
      <LightingRefTool />
    </div>
  );
}
