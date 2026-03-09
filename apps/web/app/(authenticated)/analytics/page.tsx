'use client';

import { BarChart3 } from 'lucide-react';
import { AnalyticsDashboard } from '../../../components/analytics/analytics-dashboard';

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Analytics</h1>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
