import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { extractColorScheme } from '../../../../../lib/palette-extract';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

function jwtSubject(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    return typeof payload.id === 'string' ? payload.id : null;
  } catch {
    return null;
  }
}

/**
 * Detect a project's color scheme from its cover photo and save it.
 * Runs as the calling user, so PocketBase's update rule limits it to owners.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const token = req.headers.get('authorization');
  if (!token) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const pb = new PocketBase(PB_URL);
  pb.authStore.save(token.replace(/^Bearer\s+/i, ''), null);
  const callerId = jwtSubject(pb.authStore.token);

  let project;
  try {
    project = await pb.collection('projects').getOne(projectId);
  } catch {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }
  // Check ownership before the (comparatively expensive) image analysis.
  // PocketBase's update rule is still the real gate below.
  if (!callerId || callerId !== project.user) {
    return NextResponse.json({ error: 'Only the owner can update this project' }, { status: 403 });
  }
  if (!project.cover_photo) {
    return NextResponse.json({ error: 'Add a cover photo first' }, { status: 400 });
  }

  const res = await fetch(`${PB_URL}/api/files/${project.collectionId}/${project.id}/${project.cover_photo}?thumb=600x600`);
  if (!res.ok) return NextResponse.json({ error: 'Could not load the cover photo' }, { status: 502 });

  let scheme;
  try {
    scheme = await extractColorScheme(Buffer.from(await res.arrayBuffer()));
  } catch {
    return NextResponse.json({ error: 'Could not read the cover photo' }, { status: 422 });
  }

  try {
    await pb.collection('projects').update(project.id, { color_scheme: scheme });
  } catch {
    return NextResponse.json({ error: 'Only the owner can update this project' }, { status: 403 });
  }

  return NextResponse.json({ colorScheme: scheme });
}
