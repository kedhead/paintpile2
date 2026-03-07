'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { InviteDialog } from './invite-dialog';

interface InviteButtonProps {
  groupId: string;
}

export function InviteButton({ groupId }: InviteButtonProps) {
  const [showInvite, setShowInvite] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowInvite(true)}
        className="mr-3 p-2 text-gray-400 hover:text-primary-600"
        title="Invite People"
      >
        <UserPlus className="h-4 w-4" />
      </button>
      {showInvite && <InviteDialog groupId={groupId} onClose={() => setShowInvite(false)} />}
    </>
  );
}
