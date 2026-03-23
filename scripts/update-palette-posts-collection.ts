/**
 * Updates the `palette_posts` collection in PocketBase to add:
 * - steps (json) - tutorial steps with media index references
 * - mode (text) - 'single' | 'tutorial'
 * - attribution (text)
 * - Increases media maxSelect from 5 to 12
 *
 * Usage:
 *   npx tsx scripts/update-palette-posts-collection.ts
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

  const collection = await pb.collections.getOne('palette_posts');
  console.log('Found palette_posts collection, updating fields...');

  const existingFieldNames = new Set(collection.fields.map((f: { name: string }) => f.name));

  const newFields: object[] = [];

  if (!existingFieldNames.has('steps')) {
    newFields.push({ name: 'steps', type: 'json' });
    console.log('  + steps (json)');
  } else {
    console.log('  ~ steps already exists, skipping');
  }

  if (!existingFieldNames.has('mode')) {
    newFields.push({ name: 'mode', type: 'text' });
    console.log('  + mode (text)');
  } else {
    console.log('  ~ mode already exists, skipping');
  }

  if (!existingFieldNames.has('attribution')) {
    newFields.push({ name: 'attribution', type: 'text' });
    console.log('  + attribution (text)');
  } else {
    console.log('  ~ attribution already exists, skipping');
  }

  if (newFields.length === 0) {
    console.log('No new fields to add.');
  } else {
    // Update media field maxSelect to 12 and add new fields
    const updatedFields = collection.fields.map((f: { name: string; maxSelect?: number }) => {
      if (f.name === 'media') {
        return { ...f, maxSelect: 12 };
      }
      return f;
    });

    await pb.collections.update(collection.id, {
      fields: [...updatedFields, ...newFields],
    });
    console.log(`Successfully added ${newFields.length} field(s) and updated media maxSelect to 12.`);
  }

  // Ensure media maxSelect is updated even if no new fields
  const mediaField = collection.fields.find((f: { name: string; maxSelect?: number }) => f.name === 'media');
  if (mediaField && mediaField.maxSelect !== 12) {
    const updatedFields = collection.fields.map((f: { name: string; maxSelect?: number }) => {
      if (f.name === 'media') return { ...f, maxSelect: 12 };
      return f;
    });
    await pb.collections.update(collection.id, { fields: updatedFields });
    console.log('Updated media maxSelect to 12.');
  }

  console.log('Done.');
}

main().catch(console.error);
