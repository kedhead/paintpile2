'use client';

import { Award, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAllBadges, useUserBadges, useCheckBadges } from '../../../hooks/use-badges';
import { useAuth } from '../../../components/auth-provider';
import { BadgeCard } from '../../../components/badges/badge-card';

export default function BadgesPage() {
  const { user } = useAuth();
  const { data: allBadges = [], isLoading } = useAllBadges();
  const { data: userBadges = [] } = useUserBadges(user?.id || '');
  const { mutate: checkBadges, isPending: isSyncing } = useCheckBadges();

  const [hasSynced, setHasSynced] = useState(false);

  useEffect(() => {
    if (user && !hasSynced) {
      checkBadges();
      setHasSynced(true);
    }
  }, [user, hasSynced, checkBadges]);

  const earnedIds = new Set(userBadges.map((ub) => ub.badge));
  const totalPoints = userBadges.reduce((sum, ub) => {
    const badge = ub.expand?.badge;
    return sum + (badge?.points || 0);
  }, 0);

  // Group by category
  const categories: Record<string, typeof allBadges> = {};
  allBadges.forEach((badge) => {
    if (badge.hidden && !earnedIds.has(badge.id)) return;
    const cat = badge.category || 'other';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(badge);
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Badges</h1>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-foreground">{totalPoints}</p>
          <p className="text-xs text-muted-foreground">Total Points</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Earned {userBadges.length} of {allBadges.filter((b) => !b.hidden).length} badges
        {isSyncing && (
          <span className="ml-2 inline-flex items-center gap-1 text-primary animate-pulse">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Syncing...
          </span>
        )}
      </p>

      {Object.entries(categories).map(([category, badges]) => (
        <div key={category} className="space-y-3">
          <h2 className="text-sm font-semibold capitalize text-foreground">{category}</h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
            {badges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                earned={earnedIds.has(badge.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
