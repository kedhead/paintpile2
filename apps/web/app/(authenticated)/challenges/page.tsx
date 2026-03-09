'use client';

import { Trophy } from 'lucide-react';
import { ChallengeList } from '../../../components/challenges/challenge-list';

export default function ChallengesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Challenges</h1>
      </div>
      <ChallengeList />
    </div>
  );
}
