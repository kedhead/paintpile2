import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import type { RecordModel } from 'pocketbase';
import { getDisplayName } from '@paintpile/shared';
import { ProjectWorkshopView } from '../../../../components/projects/project-workshop-view';
import { PublicProjectView } from '../../../../components/projects/public-project-view';
import { fileUrl, getViewerId, publicPb, safe, SITE_URL, viewerPb } from '../../../../lib/pb-server';
import { parseProjectId, projectPath } from '../../../../lib/urls';

type Params = { params: Promise<{ projectId: string }> };
type PageProps = Params & { searchParams: Promise<{ view?: string }> };

async function loadProject(param: string): Promise<RecordModel | null> {
  const id = parseProjectId(param);
  if (!/^[a-z0-9]{15}$/i.test(id)) return null;
  const pb = await viewerPb();
  return safe(() => pb.collection('projects').getOne(id, { expand: 'user' }), null);
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const project = await loadProject((await params).projectId);
  if (!project?.is_public) return { title: 'Project — Paintpile' };

  const author = getDisplayName(project.expand?.user, 'a painter');
  const title = `${project.name} by ${author} — Paintpile`;
  const description = project.description?.slice(0, 200) || `${project.name}, a painted miniature by ${author} on Paintpile.`;
  const images = project.cover_photo ? [fileUrl(project, project.cover_photo, '1200x0')] : undefined;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${projectPath(project)}` },
    openGraph: { title, description, url: `${SITE_URL}${projectPath(project)}`, siteName: 'Paintpile', type: 'article', images },
    twitter: { card: images ? 'summary_large_image' : 'summary', title, description, images },
  };
}

export default async function ProjectPage({ params, searchParams }: PageProps) {
  const [{ projectId }, { view }] = await Promise.all([params, searchParams]);
  const [project, viewerId] = await Promise.all([loadProject(projectId), getViewerId()]);
  if (!project) notFound();

  // Owners get their editable workshop view (unless previewing); everyone else gets the showcase.
  const isOwner = !!viewerId && viewerId === project.user;
  if (isOwner && view !== 'public') {
    return <ProjectWorkshopView projectId={project.id} />;
  }
  if (!project.is_public) notFound();

  // Normalise to the canonical slugged URL so shares and search results agree.
  const canonical = projectPath(project);
  if (!isOwner && decodeURIComponent(`/projects/${projectId}`) !== canonical) permanentRedirect(canonical);

  const pb = publicPb();
  const [photos, projectPaints, more] = await Promise.all([
    safe(() => pb.collection('photos').getFullList({ filter: pb.filter('project = {:id}', { id: project.id }), sort: 'created' }), []),
    safe(() => pb.collection('project_paints').getFullList({ filter: pb.filter('project = {:id}', { id: project.id }), expand: 'paint', sort: 'created' }), []),
    safe(
      () =>
        pb.collection('projects').getList(1, 5, {
          filter: pb.filter('user = {:user} && is_public = true && cover_photo != "" && id != {:id}', { user: project.user, id: project.id }),
          sort: '-like_count,-created',
        }),
      null,
    ),
  ]);

  return (
    <>
      {isOwner && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5 text-sm">
          <span className="text-muted-foreground">This is how visitors see your project.</span>
          <Link href={`/projects/${project.id}`} className="font-medium text-primary hover:underline">Back to editing</Link>
        </div>
      )}
      <PublicProjectView
      project={project}
      photos={photos.filter((p) => p.image)}
      projectPaints={projectPaints}
      moreFromAuthor={more?.items ?? []}
      />
    </>
  );
}
