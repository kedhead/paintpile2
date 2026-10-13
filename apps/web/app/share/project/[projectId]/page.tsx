import { permanentRedirect } from 'next/navigation';

// Old share links → the public project page (which carries the OG tags now).
export default async function ShareProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  permanentRedirect(`/projects/${projectId}`);
}
