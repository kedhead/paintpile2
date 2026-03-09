'use client';

import { Activity } from 'lucide-react';
import { ActivityFeed } from '../../../components/activity/activity-feed';

export default function ActivityPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Activity Feed</h1>
      </div>
      <ActivityFeed />
    </div>
  );
}
