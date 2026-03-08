'use client';

import { X } from 'lucide-react';
import type { RecordModel } from 'pocketbase';
import { UserCard } from '../social/user-card';
import { useAuth } from '../auth-provider';

interface FollowerListModalProps {
  title: string;
  records: RecordModel[];
  expandKey: 'follower' | 'following';
  onClose: () => void;
}

export function FollowerListModal({ title, records, expandKey, onClose }: FollowerListModalProps) {
  const { user } = useAuth();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-md rounded-lg bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto px-4 py-2">
          {records.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No users yet</p>
          ) : (
            records.map((record) => {
              const expanded = record.expand?.[expandKey] as RecordModel | undefined;
              if (!expanded) return null;
              return (
                <UserCard
                  key={record.id}
                  user={expanded}
                  showFollowButton
                  currentUserId={user?.id}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
