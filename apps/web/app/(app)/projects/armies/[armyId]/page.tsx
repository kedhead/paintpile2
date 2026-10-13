'use client';

import { use } from 'react';
import { Loader2 } from 'lucide-react';
import { useArmy } from '../../../../../hooks/use-armies';
import { ArmyDetail } from '../../../../../components/armies/army-detail';

export default function ArmyDetailPage({ params }: { params: Promise<{ armyId: string }> }) {
  const { armyId } = use(params);
  const { data: army, isLoading } = useArmy(armyId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!army) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Army not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <ArmyDetail army={army} />
    </div>
  );
}
