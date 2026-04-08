export function GET() {
  const body = `User-agent: *
Allow: /
Sitemap: https://thepaintpile.com/sitemap.xml
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
