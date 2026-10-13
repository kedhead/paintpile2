import PocketBase from 'pocketbase';
import { profilePath, projectPath } from '../../lib/urls';

const SITE_URL = 'https://thepaintpile.com';
const PB_URL = process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

// Rebuild hourly from live data (otherwise it's frozen at build time).
export const revalidate = 3600;

export async function GET() {
  const pb = new PocketBase(PB_URL);
  const now = new Date().toISOString().split('T')[0];

  // Static pages
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/?sort=latest', priority: '0.9', changefreq: 'hourly' },
    { url: '/feed', priority: '0.8', changefreq: 'hourly' },
    { url: '/challenges', priority: '0.8', changefreq: 'daily' },
    { url: '/painters', priority: '0.8', changefreq: 'daily' },
    { url: '/collections', priority: '0.7', changefreq: 'daily' },
    { url: '/paints', priority: '0.8', changefreq: 'weekly' },
    { url: '/auth/login', priority: '0.5', changefreq: 'monthly' },
    { url: '/auth/signup', priority: '0.5', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
    { url: '/terms', priority: '0.3', changefreq: 'yearly' },
    { url: '/tools/color-matcher', priority: '0.6', changefreq: 'monthly' },
    { url: '/tools/paint-mixer', priority: '0.6', changefreq: 'monthly' },
    { url: '/tools/lighting-ref', priority: '0.6', changefreq: 'monthly' },
  ];

  let dynamicEntries = '';
  try {
    // Public projects, plus a profile entry for everyone who has one
    const projects = await pb.collection('projects').getList(1, 1000, {
      filter: 'is_public = true',
      sort: '-updated',
      expand: 'user',
      fields: 'id,name,updated,expand.user.id,expand.user.username',
    });
    const profiles = new Map<string, string>();
    for (const p of projects.items) {
      const lastmod = new Date(p.updated).toISOString().split('T')[0];
      dynamicEntries += `
  <url>
    <loc>${SITE_URL}${projectPath(p)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      const author = p.expand?.user;
      if (author && !profiles.has(author.id)) profiles.set(author.id, profilePath(author));
    }
    for (const path of profiles.values()) {
      dynamicEntries += `
  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }
  } catch {
    // PB unreachable — skip dynamic entries
  }

  const staticEntries = staticPages
    .map(
      (p) => `
  <url>
    <loc>${SITE_URL}${p.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}${dynamicEntries}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
