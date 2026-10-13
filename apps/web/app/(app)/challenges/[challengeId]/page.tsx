'use client';

import { use } from 'react';
import { ChallengeDetail } from '../../../../components/challenges/challenge-detail';

export default function ChallengeDetailPage({ params }: { params: Promise<{ challengeId: string }> }) {
  const { challengeId } = use(params);
  return (
    <div className="mx-auto max-w-2xl">
      <ChallengeDetail challengeId={challengeId} />
    </div>
  );
}
