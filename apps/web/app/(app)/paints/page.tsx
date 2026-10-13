'use client';

import { Suspense } from 'react';
import { PaintLibraryPage } from '../../../components/paints/paint-library-page';

export default function PaintsPage() {
  // Suspense: the library reads ?q= via useSearchParams.
  return (
    <Suspense>
      <PaintLibraryPage />
    </Suspense>
  );
}
