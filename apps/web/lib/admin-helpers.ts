import PocketBase from 'pocketbase';

const pbUrl = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';

export async function validateAdminAuth(pbToken: string): Promise<{ pb: PocketBase; userId: string }> {
  const pb = new PocketBase(pbUrl);
  pb.authStore.save(pbToken, null);

  try {
    const result = await pb.collection('users').authRefresh();
    const user = result.record;
    if (user.role !== 'admin') {
      throw new Error('Not an admin');
    }
    return { pb, userId: user.id };
  } catch {
    throw new Error('Unauthorized');
  }
}
