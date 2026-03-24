'use client';

const ONLINE_THRESHOLD = 5 * 60 * 1000; // 5 minutes

interface OnlineIndicatorProps {
  lastActiveAt?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showLastSeen?: boolean;
}

const sizeClasses = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
};

function getLastSeenText(lastActiveAt: string): string {
  const diff = Date.now() - new Date(lastActiveAt).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Active just now';
  if (minutes < 60) return `Active ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Active ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `Active ${days}d ago`;
}

export function OnlineIndicator({ lastActiveAt, size = 'md', showLastSeen = false }: OnlineIndicatorProps) {
  if (!lastActiveAt) return null;

  const diff = Date.now() - new Date(lastActiveAt).getTime();
  const isOnline = diff < ONLINE_THRESHOLD;

  if (!isOnline && !showLastSeen) return null;

  if (!isOnline && showLastSeen) {
    return (
      <span className="text-xs text-muted-foreground" title={getLastSeenText(lastActiveAt)}>
        {getLastSeenText(lastActiveAt)}
      </span>
    );
  }

  return (
    <span
      className={`inline-block ${sizeClasses[size]} rounded-full bg-green-500 ring-2 ring-card`}
      title="Online"
    />
  );
}

export function isUserOnline(lastActiveAt?: string | null): boolean {
  if (!lastActiveAt) return false;
  return Date.now() - new Date(lastActiveAt).getTime() < ONLINE_THRESHOLD;
}
