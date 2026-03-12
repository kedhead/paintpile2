export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString();
}

export function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffSeconds = Math.floor((now - then) / 1000);

  if (diffSeconds < 60) return 'just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;
  return formatDate(isoString);
}

export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Returns a public display name for a user, preferring username over real name.
 */
export function getDisplayName(
  user: Record<string, unknown> | null | undefined,
  fallback = 'Painter'
): string {
  if (!user) return fallback;
  if (user.username) return `@${user.username}`;
  return (user.name as string) || (user.displayName as string) || fallback;
}
