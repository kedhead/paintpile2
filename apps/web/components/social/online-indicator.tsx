'use client';

interface OnlineIndicatorProps {
  lastActiveAt?: string | null;
}

export function OnlineIndicator({ lastActiveAt }: OnlineIndicatorProps) {
  if (!lastActiveAt) return null;

  const diff = Date.now() - new Date(lastActiveAt).getTime();
  const isOnline = diff < 5 * 60 * 1000; // 5 minutes

  if (!isOnline) return null;

  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-card"
      title="Online"
    />
  );
}
