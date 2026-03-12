'use client';

import type { RecordModel } from 'pocketbase';
import { Shield, Crown, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { getDisplayName } from '@paintpile/shared';
import { UserAvatar } from '../social/user-avatar';
import { useMyGroupRole } from '../../hooks/use-my-role';
import { useUpdateMemberRole, useKickMember } from '../../hooks/use-group-members';

interface MemberItemProps {
  member: RecordModel;
  groupId: string;
}

const roleBadge = {
  admin: { icon: Crown, color: 'text-yellow-400' },
  moderator: { icon: Shield, color: 'text-blue-400' },
  member: { icon: null, color: '' },
};

export function MemberItem({ member, groupId }: MemberItemProps) {
  const { canKickMembers } = useMyGroupRole(groupId);
  const updateRole = useUpdateMemberRole();
  const kickMember = useKickMember();
  const [showMenu, setShowMenu] = useState(false);

  const user = member.expand?.user as RecordModel | undefined;
  const displayName = getDisplayName(user, 'Unknown');
  const badge = roleBadge[member.role as keyof typeof roleBadge] || roleBadge.member;
  const BadgeIcon = badge.icon;

  return (
    <div className="group flex items-center gap-2 rounded px-2 py-1 hover:bg-muted relative">
      {user && <UserAvatar user={user} size="sm" />}
      <span className="flex-1 truncate text-sm text-foreground">{displayName}</span>
      {BadgeIcon && <BadgeIcon className={`h-3.5 w-3.5 ${badge.color}`} />}

      {canKickMembers && member.role !== 'admin' && (
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-muted-foreground"
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
      )}

      {showMenu && (
        <div className="absolute right-0 top-full z-10 rounded-lg border border-border bg-card py-1 shadow-lg min-w-[120px]">
          {member.role === 'member' && (
            <button
              onClick={() => {
                updateRole.mutate({ memberId: member.id, role: 'moderator', groupId });
                setShowMenu(false);
              }}
              className="w-full px-3 py-1.5 text-left text-sm text-foreground hover:bg-background"
            >
              Make Mod
            </button>
          )}
          {member.role === 'moderator' && (
            <button
              onClick={() => {
                updateRole.mutate({ memberId: member.id, role: 'member', groupId });
                setShowMenu(false);
              }}
              className="w-full px-3 py-1.5 text-left text-sm text-foreground hover:bg-background"
            >
              Remove Mod
            </button>
          )}
          <button
            onClick={() => {
              kickMember.mutate({ memberId: member.id, groupId });
              setShowMenu(false);
            }}
            className="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:bg-red-900/30"
          >
            Kick
          </button>
        </div>
      )}
    </div>
  );
}
