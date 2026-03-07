'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';
import { getPermissions } from '../lib/group-permissions';
import type { GroupMemberRole } from '@paintpile/shared';

export function useMyGroupRole(groupId: string) {
  const { pb, user } = useAuth();

  const { data: membership } = useQuery({
    queryKey: [...queryKeys.groups.members(groupId), 'my-role', user?.id],
    queryFn: async () => {
      const records = await pb.collection('group_members').getFullList({
        filter: `group = "${groupId}" && user = "${user!.id}"`,
      });
      return records[0] || null;
    },
    enabled: !!user && !!groupId,
  });

  const role = (membership?.role as GroupMemberRole) || null;
  const permissions = getPermissions(role);

  return {
    role,
    isMember: !!membership,
    ...permissions,
  };
}
