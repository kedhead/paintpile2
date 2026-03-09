'use client';

import Link from 'next/link';
import type { RecordModel } from 'pocketbase';
import { Trophy, Clock, Users, Loader2 } from 'lucide-react';
import { useChallenges } from '../../hooks/use-challenges';
import { relativeTime } from '../../lib/pb-helpers';

export function ChallengeList() {
  const { data: challenges = [], isLoading } = useChallenges();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const active = challenges.filter((c: RecordModel) => c.status === 'active' || c.status === 'voting');
  const past = challenges.filter((c: RecordModel) => c.status === 'completed');

  return (
    <div className="space-y-6">
      {active.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Active Challenges</h2>
          {active.map((challenge: RecordModel) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Past Challenges</h2>
          {past.map((challenge: RecordModel) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}

      {challenges.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <Trophy className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No challenges yet</p>
        </div>
      )}
    </div>
  );
}

function ChallengeCard({ challenge }: { challenge: RecordModel }) {
  const isActive = challenge.status === 'active';
  const endDate = challenge.end_date ? new Date(challenge.end_date) : null;
  const daysLeft = endDate ? Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;

  return (
    <Link
      href={`/challenges/${challenge.id}`}
      className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted"
    >
      <div className="flex items-start gap-3">
        <Trophy className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-muted-foreground'}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{challenge.title}</h3>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              isActive ? 'bg-green-500/20 text-green-400' :
              challenge.status === 'voting' ? 'bg-amber-500/20 text-amber-400' :
              'bg-muted text-muted-foreground'
            }`}>
              {challenge.status}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{challenge.description}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {challenge.participant_count || 0} entries
            </span>
            {daysLeft !== null && isActive && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {daysLeft} days left
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
