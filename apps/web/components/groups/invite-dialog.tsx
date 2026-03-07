'use client';

import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { useGroupInvites, useCreateInvite, useDeleteInvite } from '../../hooks/use-group-invites';
import { relativeTime } from '../../lib/pb-helpers';

interface InviteDialogProps {
  groupId: string;
  onClose: () => void;
}

export function InviteDialog({ groupId, onClose }: InviteDialogProps) {
  const { data: invites } = useGroupInvites(groupId);
  const createInvite = useCreateInvite();
  const deleteInvite = useDeleteInvite();
  const [copied, setCopied] = useState<string | null>(null);

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/groups/join/${code}`);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCreate = async () => {
    await createInvite.mutateAsync({ groupId });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Invite People</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <button
          onClick={handleCreate}
          disabled={createInvite.isPending}
          className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50 mb-4"
        >
          Generate New Invite Link
        </button>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {invites?.map((invite) => (
            <div key={invite.id} className="flex items-center gap-2 rounded border border-gray-200 p-2">
              <code className="flex-1 truncate text-xs text-gray-600">{invite.code}</code>
              <span className="text-xs text-gray-400">{relativeTime(invite.created)}</span>
              <button
                onClick={() => copyLink(invite.code)}
                className="p-1 text-gray-400 hover:text-primary-600"
              >
                {copied === invite.code ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => deleteInvite.mutate({ inviteId: invite.id, groupId })}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {invites?.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-4">No invite links yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
