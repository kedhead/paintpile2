'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LayoutDashboard, Loader2 } from 'lucide-react';
import { AnalyticsDashboard } from '../../../components/analytics/analytics-dashboard';
import { ActivityFeed } from '../../../components/activity/activity-feed';

type DashboardTab = 'overview' | 'activity';

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'activity' ? 'activity' : 'overview';
  const [tab, setTab] = useState<DashboardTab>(initialTab);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center gap-2">
        <LayoutDashboard className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => setTab('overview')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === 'overview' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setTab('activity')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === 'activity' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Activity
        </button>
      </div>

      {tab === 'overview' ? (
        <div className="space-y-6">
          <AnalyticsDashboard />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
              <button
                onClick={() => setTab('activity')}
                className="text-xs font-medium text-primary hover:underline"
              >
                View all &rarr;
              </button>
            </div>
            <ActivityFeed limit={10} showFilters={false} />
          </div>
        </div>
      ) : (
        <ActivityFeed />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
