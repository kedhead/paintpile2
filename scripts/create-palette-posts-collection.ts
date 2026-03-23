/**
 * Creates the `palette_posts` collection in PocketBase.
 *
 * Usage:
 *   npx tsx scripts/create-palette-posts-collection.ts
 *
 * Requires PB_URL and PB_ADMIN_EMAIL / PB_ADMIN_PASSWORD env vars,
 * or defaults to the project's known admin credentials.
 */

import PocketBase from 'pocketbase';

const PB_URL = process.env.PB_URL || 'https://thepaintpile.com';
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@paintpile.app';
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'paintpile2admin';

async function main() {
  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log('Authenticated as admin');

  // Check if collection already exists
  try {
    await pb.collections.getOne('palette_posts');
    console.log('Collection "palette_posts" already exists — skipping.');
    return;
  } catch {
    // Does not exist, create it
  }

  await pb.collections.create({
    name: 'palette_posts',
    type: 'base',
    fields: [
      { name: 'user', type: 'relation', required: true, collectionId: '_pb_users_auth_', maxSelect: 1, cascadeDelete: true },
      { name: 'title', type: 'text' },
      { name: 'paints', type: 'json' },
      { name: 'theme', type: 'text' },
      { name: 'background_color', type: 'text' },
      { name: 'layout', type: 'text' },
      { name: 'image', type: 'file', maxSelect: 1, maxSize: 10485760, mimeTypes: ['image/png', 'image/jpeg', 'image/webp'] },
      { name: 'media', type: 'file', maxSelect: 5, maxSize: 52428800, mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'video/webm'] },
      { name: 'caption', type: 'text' },
      { name: 'is_public', type: 'bool' },
      { name: 'project', type: 'relation', collectionId: 'pbc_484305853', maxSelect: 1 },
    ],
    listRule: 'user = @request.auth.id || is_public = true',
    viewRule: 'user = @request.auth.id || is_public = true',
    createRule: '@request.auth.id != ""',
    updateRule: 'user = @request.auth.id',
    deleteRule: 'user = @request.auth.id',
  });

  console.log('Created "palette_posts" collection successfully!');
}

main().catch(console.error);
