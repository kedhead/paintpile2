'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGroupChannels } from '../../../../hooks/use-group-channels';
import type { RecordModel } from 'pocketbase';

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params?.groupId as string;
  const { data: channels, isLoading } = useGroupChannels(groupId);

  useEffect(() => {
    if (channels && channels.length > 0) {
      const firstText = channels.find((c: RecordModel) => c.type === 'text') || channels[0];
      router.replace(`/groups/${groupId}/${firstText.id}`);
    }
  }, [channels, groupId, router]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center text-muted-foreground">
      No channels yet. Create one to get started!
    </div>
  );
}
