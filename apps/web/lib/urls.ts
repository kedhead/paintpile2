// Canonical, shareable URLs for public content. Safe to import from both
// server and client components.

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** `/projects/abc123-spooky-bulba` — the slug is cosmetic, only the id is read. */
export function projectPath(project: { id: string; name?: string }): string {
  const slug = project.name ? slugify(project.name) : '';
  return slug ? `/projects/${project.id}-${slug}` : `/projects/${project.id}`;
}

/** PocketBase ids never contain dashes, so everything before the first one is the id. */
export function parseProjectId(param: string): string {
  return decodeURIComponent(param).split('-')[0];
}

/** `/kedhead` — falls back to the record id for accounts without a username. */
export function profilePath(user: { id: string; username?: string }): string {
  return `/${user.username || user.id}`;
}
