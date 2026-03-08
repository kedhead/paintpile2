'use client';

import type { RecordModel } from 'pocketbase';
import { MemberItem } from './member-item';

interface MemberListProps {
  members: RecordModel[];
  groupId: string;
}

export function MemberList({ members, groupId }: MemberListProps) {
  const admins = members.filter((m) => m.role === 'admin');
  const mods = members.filter((m) => m.role === 'moderator');
  const regulars = members.filter((m) => m.role === 'member');

  const renderSection = (title: string, items: RecordModel[]) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-3">
        <h4 className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title} — {items.length}
        </h4>
        {items.map((member) => (
          <MemberItem key={member.id} member={member} groupId={groupId} />
        ))}
      </div>
    );
  };

  return (
    <aside className="hidden lg:flex w-[200px] flex-col border-l border-border bg-background overflow-y-auto py-3">
      {renderSection('Admin', admins)}
      {renderSection('Moderators', mods)}
      {renderSection('Members', regulars)}
    </aside>
  );
}
