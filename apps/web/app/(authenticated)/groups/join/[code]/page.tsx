'use client';

import { useParams } from 'next/navigation';
import { JoinByInvite } from '../../../../../components/groups/join-by-invite';

export default function JoinPage() {
  const params = useParams();
  const code = params.code as string;

  return <JoinByInvite code={code} />;
}
