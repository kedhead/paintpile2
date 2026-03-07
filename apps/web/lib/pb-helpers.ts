import type { RecordModel } from 'pocketbase';
import { getClient } from './pocketbase';

export function getFileUrl(
  record: RecordModel,
  filename: string,
  thumb?: string
): string {
  const pb = getClient();
  return pb.files.getURL(record, filename, thumb ? { thumb } : undefined);
}

export function getAvatarUrl(
  record: RecordModel,
  thumb: string = '100x100'
): string | null {
  if (!record.avatar) return null;
  return getFileUrl(record, record.avatar, thumb);
}

export function relativeTime(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}
