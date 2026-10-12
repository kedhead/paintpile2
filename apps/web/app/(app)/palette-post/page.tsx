'use client';

import { PalettePostWizard } from '../../../components/palette-post/palette-post-wizard';

export default function PalettePostPage() {
  return (
    <div className="py-6 px-4">
      <h1 className="mb-6 text-center text-2xl font-bold text-foreground">
        Create Palette Post
      </h1>
      <PalettePostWizard />
    </div>
  );
}
