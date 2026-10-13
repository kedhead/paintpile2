import { redirect } from 'next/navigation';
import { getViewerId, safe, viewerPb } from '../../../lib/pb-server';
import { profilePath } from '../../../lib/urls';

// "My profile" → your public /username page (editing happens in place there).
export default async function MyProfilePage() {
  const viewerId = await getViewerId();
  if (!viewerId) redirect('/auth/login');
  const pb = await viewerPb();
  const user = await safe(() => pb.collection('users').getOne(viewerId, { fields: 'id,username' }), null);
  redirect(user ? profilePath(user) : '/settings/account');
}
