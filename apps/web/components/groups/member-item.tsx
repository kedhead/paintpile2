'use client';

import type { RecordModel } from 'pocketbase';
import { Shield, Crown, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { UserAvatar } from '../social/user-avatar';
import { useMyGroupRole } from '../../hooks/use-my-role';
import { useUpdateMemberRole, useKickMember } from '../../hooks/use-group-members';

interface MemberItemProps {
  member: RecordModel;
  groupId: string;
}

const roleBadge = {
  admin: { icon: Crown, color: 'text-yellow-500' },
  moderator: { icon: Shield, color: 'text-blue-500' },
  member: { icon: null, color: '' },
};

export function MemberItem({ member, groupId }: MemberItemProps) {
  const { canKickMembers } = useMyGroupRole(groupId);
  const updateRole = useUpdateMemberRole();
  const kickMember = useKickMember();
  const [showMenu, setShowMenu] = useState(false);

  const user = member.expand?.user as RecordModel | undefined;
  const displayName = user?.name || user?.displayName || 'Unknown';
  const badge = roleBadge[member.role as keyof typeof roleBadge] || roleBadge.member;
  const BadgeIcon = badge.icon;

  return (
    <div className="group flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-100 relative">
      {user && <UserAvatar user={user} size="sm" />}
      <span className="flex-1 truncate text-sm text-gray-800">{displayName}</span>
      {BadgeIcon && <BadgeIcon className={`h-3.5 w-3.5 ${badge.color}`} />}

      {canKickMembers && member.role !== 'admin' && (
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-0.5 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-600"
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
      )}

      {showMenu && (
        <div className="absolute right-0 top-full z-10 rounded-lg border border-gray-200 bg-white py-1 shadow-lg min-w-[120px]">
          {member.role === 'member' && (
            <button
              onClick={() => {
                updateRole.mutate({ memberId: member.id, role: 'moderator', groupId });
                setShowMenu(false);
              }}
              className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50"
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
              className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              Remove Mod
            </button>
          )}
          <button
            onClick={() => {
              kickMember.mutate({ memberId: member.id, groupId });
              setShowMenu(false);
            }}
            className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Kick
          </button>
        </div>
      )}
    </div>
  );
}
