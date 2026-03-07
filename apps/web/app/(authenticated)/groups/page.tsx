'use client';

import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import { usePublicGroups } from '../../../hooks/use-groups';
import { useJoinGroup } from '../../../hooks/use-group-members';
import type { RecordModel } from 'pocketbase';

export default function GroupsPage() {
  const router = useRouter();
  const { data: publicGroups, isLoading } = usePublicGroups();
  const joinGroup = useJoinGroup();

  const handleJoin = async (groupId: string) => {
    await joinGroup.mutateAsync(groupId);
    router.push(`/groups/${groupId}`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Discover Groups</h1>
      <p className="text-sm text-gray-500 mb-6">Find communities to join, or create your own.</p>

      {isLoading ? (
        <div className="text-center text-gray-400 py-10">Loading groups...</div>
      ) : publicGroups?.length === 0 ? (
        <div className="text-center py-20">
          <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-gray-700 font-medium mb-1">No groups yet</h3>
          <p className="text-sm text-gray-400">Create the first one using the + button!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {publicGroups?.map((group: RecordModel) => (
            <div
              key={group.id}
              className="rounded-lg border border-gray-200 bg-white p-4 hover:border-primary-300 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700 font-bold">
                  {group.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
                  <p className="text-xs text-gray-400">{group.member_count || 0} members</p>
                </div>
              </div>
              {group.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{group.description}</p>
              )}
              <button
                onClick={() => handleJoin(group.id)}
                disabled={joinGroup.isPending}
                className="w-full rounded-lg bg-primary-600 px-3 py-1.5 text-sm text-white hover:bg-primary-700 disabled:opacity-50"
              >
                Join
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
