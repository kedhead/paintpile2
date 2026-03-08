'use client';

import { useParams } from 'next/navigation';
import { useGroup } from '../../../../../hooks/use-groups';
import { GroupSettings } from '../../../../../components/groups/group-settings';

export default function GroupSettingsPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const { data: group, isLoading } = useGroup(groupId);

  if (isLoading || !group) {
    return <div className="flex flex-1 items-center justify-center text-muted-foreground">Loading...</div>;
  }

  return <GroupSettings group={group} />;
}
