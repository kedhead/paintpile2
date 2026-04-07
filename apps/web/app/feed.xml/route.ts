import PocketBase from 'pocketbase';

const SITE_URL = 'https://thepaintpile.com';
const PB_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const pb = new PocketBase(PB_URL);

  let items = '';
  try {
    const posts = await pb.collection('posts').getList(1, 30, {
      sort: '-created',
      filter: 'is_public = true',
      expand: 'user',
    });

    for (const post of posts.items) {
      const author = post.expand?.user;
      const authorName = author?.name || author?.username || 'A painter';
      const title = escapeXml(
        post.caption
          ? post.caption.slice(0, 100) + (post.caption.length > 100 ? '…' : '')
          : `Post by ${authorName}`
      );
      const link = `${SITE_URL}/feed`;
      const pubDate = new Date(post.created).toUTCString();
      const description = escapeXml(post.caption || '');

      // Build image tag if post has an image
      let imageHtml = '';
      if (post.image) {
        const imgUrl = `${SITE_URL}/api/files/posts/${post.id}/${post.image}`;
        imageHtml = `&lt;img src="${escapeXml(imgUrl)}" alt="" /&gt;&lt;br/&gt;`;
      }

      items += `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="false">${post.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(authorName)}</author>
      <description>${imageHtml}${description}</description>
    </item>`;
    }
  } catch (e) {
    // If PB is unreachable, return an empty but valid feed
    console.error('RSS feed error:', e);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Paintpile - Miniature Painting Community</title>
    <link>${SITE_URL}</link>
    <description>The latest posts from the Paintpile miniature painting community. Track projects, share recipes, and connect with fellow hobbyists.</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
