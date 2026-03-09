'use client';

import { Award } from 'lucide-react';
import { useUserBadges } from '../../hooks/use-badges';
import { BadgeCard } from './badge-card';

interface ProfileBadgesProps {
  userId: string;
}

export function ProfileBadges({ userId }: ProfileBadgesProps) {
  const { data: userBadges = [] } = useUserBadges(userId);

  if (userBadges.length === 0) return null;

  const totalPoints = userBadges.reduce((sum, ub) => {
    const badge = ub.expand?.badge;
    return sum + (badge?.points || 0);
  }, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Award className="h-4 w-4 text-primary" />
          Badges
        </h3>
        <span className="text-xs text-muted-foreground">{totalPoints} points</span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {userBadges.slice(0, 8).map((ub) => {
          const badge = ub.expand?.badge;
          if (!badge) return null;
          return (
            <BadgeCard
              key={ub.id}
              badge={badge}
              earned
              earnedAt={ub.earned_at}
            />
          );
        })}
      </div>
      {userBadges.length > 8 && (
        <p className="text-center text-xs text-muted-foreground">
          +{userBadges.length - 8} more badges
        </p>
      )}
    </div>
  );
}
