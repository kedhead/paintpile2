import type { GroupMemberRole } from '@paintpile/shared';

export interface GroupPermissions {
  canManageChannels: boolean;
  canKickMembers: boolean;
  canDeleteAnyMessage: boolean;
  canManageGroup: boolean;
  canCreateInvites: boolean;
  canUpdateRoles: boolean;
}

export function getPermissions(role: GroupMemberRole | null): GroupPermissions {
  if (!role) {
    return {
      canManageChannels: false,
      canKickMembers: false,
      canDeleteAnyMessage: false,
      canManageGroup: false,
      canCreateInvites: false,
      canUpdateRoles: false,
    };
  }

  switch (role) {
    case 'admin':
      return {
        canManageChannels: true,
        canKickMembers: true,
        canDeleteAnyMessage: true,
        canManageGroup: true,
        canCreateInvites: true,
        canUpdateRoles: true,
      };
    case 'moderator':
      return {
        canManageChannels: false,
        canKickMembers: true,
        canDeleteAnyMessage: true,
        canManageGroup: false,
        canCreateInvites: true,
        canUpdateRoles: false,
      };
    case 'member':
      return {
        canManageChannels: false,
        canKickMembers: false,
        canDeleteAnyMessage: false,
        canManageGroup: false,
        canCreateInvites: true,
        canUpdateRoles: false,
      };
  }
}
