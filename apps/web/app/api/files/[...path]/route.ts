import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy PocketBase file URLs through HTTPS.
 * Usage: /api/files/{collectionId}/{recordId}/{filename}
 * This allows Instagram (which requires HTTPS image URLs) to access PocketBase files.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;

  if (!path || path.length < 3) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
  const filePath = path.join('/');
  const upstream = `${pbUrl}/api/files/${filePath}`;

  try {
    const res = await fetch(upstream);
    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    const buffer = Buffer.from(await res.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 502 });
  }
}
