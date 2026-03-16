import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

/**
 * Proxy PocketBase file URLs through HTTPS.
 * Usage: /api/files/{collectionId}/{recordId}/{filename}
 * Optional query params:
 *   ?w=400&h=400  — resize to fit within dimensions
 *   ?q=80         — JPEG quality (default 80)
 */
export async function GET(
  req: NextRequest,
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

    const arrayBuf = await res.arrayBuffer();
    let buffer: Buffer = Buffer.from(new Uint8Array(arrayBuf));
    let contentType = res.headers.get('content-type') || 'application/octet-stream';

    // Resize if w or h query params are provided
    const w = req.nextUrl.searchParams.get('w');
    const h = req.nextUrl.searchParams.get('h');
    const q = parseInt(req.nextUrl.searchParams.get('q') || '80', 10);

    if ((w || h) && contentType.startsWith('image/')) {
      buffer = await sharp(buffer)
        .rotate()
        .resize(w ? parseInt(w, 10) : undefined, h ? parseInt(h, 10) : undefined, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: q })
        .toBuffer();
      contentType = 'image/jpeg';
    }

    return new NextResponse(buffer as unknown as BodyInit, {
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
