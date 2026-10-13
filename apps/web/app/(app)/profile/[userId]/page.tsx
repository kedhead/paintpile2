import { notFound, permanentRedirect } from 'next/navigation';
import { publicPb, safe } from '../../../../lib/pb-server';
import { profilePath } from '../../../../lib/urls';

// Legacy id-based profile URL → canonical /username.
export default async function LegacyProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const user = await safe(() => publicPb().collection('users').getOne(userId, { fields: 'id,username' }), null);
  if (!user) notFound();
  permanentRedirect(profilePath(user));
}
