// Route list, head tags and sitemap for the static route files (ADR-047, ADR-048).
// Pure functions with no imports, so `node --test` can run them. The Vite glue is in routeFilesPlugin.ts.

export const SITE = 'https://sakethv7.github.io';
export const SITE_NAME = 'Saketh Velidimalla';
export const WARN_LENGTH = 160;
export const FAIL_LENGTH = 200;

export interface RouteHead {
  path: string; // starts and ends with "/", for example "/writing/x/"
  title: string; // full <title>
  description: string;
  type: 'website' | 'article';
  sitemap: boolean;
  lastmod?: string;
  canonicalPath?: string; // when the page should point at another page
  keepHead?: boolean; // home keeps the hand-written tags in index.html
  body?: string; // slug of src/content/<slug>.md, when the page has a Markdown body
}

interface WorkLike { slug: string; plain: string; title: string; caseStudy?: string; updated?: string }
interface PublicationLike { slug: string; plain: string; title: string; status: string; date?: string }
interface ExperienceLike { caseStudy?: { slug: string; title: string; plain: string } }
export interface SiteData { work: WorkLike[]; publications: PublicationLike[]; experiences: ExperienceLike[] }

const titleOf = (name: string) => `${name} | ${SITE_NAME}`;
const writingText = 'Notes on evaluating, operating, and debugging AI systems. Research notes cite their sources, and my own reading is labelled.';

export function buildRoutes({ work, publications, experiences }: SiteData): RouteHead[] {
  const routes: RouteHead[] = [
    { path: '/', title: '', description: '', type: 'website', sitemap: true, keepHead: true },
    { path: '/work/', title: titleOf('Work archive'), type: 'website', sitemap: true,
      description: 'Production-facing systems, developer tools and experiments. Each entry says whether it is deployed work, a prototype or learning work.' },
    { path: '/experience/', title: titleOf('Experience'), type: 'website', sitemap: true,
      description: 'From marketplace machine learning to hardware telemetry and production enterprise AI quality systems.' },
    { path: '/writing/', title: titleOf('Writing'), description: writingText, type: 'website', sitemap: true },
    { path: '/resume/', title: titleOf('Résumé'), type: 'website', sitemap: true,
      description: 'One page, current résumé of Saketh Velidimalla, an applied AI systems engineer.' },
    // /research redirects in React. It gets a file so the host answers 200 (ADR-047).
    { path: '/research/', title: titleOf('Writing'), description: writingText, type: 'website', sitemap: false, canonicalPath: '/writing/' },
  ];
  for (const item of work) {
    if (item.caseStudy) routes.push({ path: `/work/${item.slug}/`, title: titleOf(item.title), description: item.plain, type: 'article', sitemap: true, lastmod: item.updated, body: item.caseStudy });
  }
  for (const entry of experiences) {
    const study = entry.caseStudy;
    if (study) routes.push({ path: `/experience/${study.slug}/`, title: titleOf(study.title), description: study.plain, type: 'article', sitemap: true, body: study.slug });
  }
  for (const note of publications) {
    if (note.status === 'Published') routes.push({ path: `/writing/${note.slug}/`, title: titleOf(note.title), description: note.plain, type: 'article', sitemap: true, lastmod: note.date, body: note.slug });
  }
  return routes;
}

export interface Checks { errors: string[]; warnings: string[] }

export function checkRoutes(routes: RouteHead[], markdownSlugs: Set<string>): Checks {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seen = new Set<string>();
  for (const route of routes) {
    if (seen.has(route.path)) errors.push(`prerender: duplicate route "${route.path}"`);
    seen.add(route.path);
    if (route.body && !markdownSlugs.has(route.body)) errors.push(`prerender: missing note file for slug "${route.body}"`);
    const length = route.description.length;
    if (length > FAIL_LENGTH) errors.push(`prerender: description too long (${length} characters) for "${route.path}"`);
    else if (length > WARN_LENGTH) warnings.push(`prerender: description is ${length} characters for "${route.path}"`);
  }
  return { errors, warnings };
}

export const fileOf = (path: string) => (path === '/' ? 'index.html' : `${path.slice(1)}index.html`);
export const urlOf = (base: string, path: string) => `${SITE}${base}${path.slice(1)}`;

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function setMeta(html: string, attr: 'name' | 'property', key: string, content: string): string {
  const tag = `<meta ${attr}="${key}" content="${escapeHtml(content)}" />`;
  const pattern = new RegExp(`<meta ${attr}="${key}"[^>]*>`);
  return pattern.test(html) ? html.replace(pattern, () => tag) : html.replace('</head>', () => `    ${tag}\n  </head>`);
}

function setCanonical(html: string, href: string): string {
  const tag = `<link rel="canonical" href="${escapeHtml(href)}" />`;
  const pattern = /<link rel="canonical"[^>]*>/;
  return pattern.test(html) ? html.replace(pattern, () => tag) : html.replace('</head>', () => `    ${tag}\n  </head>`);
}

// The template is dist/index.html. The plugin replaces each tag once and never adds a second one.
export function renderHtml(template: string, route: RouteHead, base: string): string {
  const canonical = urlOf(base, route.canonicalPath ?? route.path);
  let html = setCanonical(template, canonical);
  if (route.keepHead) return html;
  html = html.replace(/<title>[^<]*<\/title>/, () => `<title>${escapeHtml(route.title)}</title>`);
  html = setMeta(html, 'name', 'description', route.description);
  html = setMeta(html, 'property', 'og:title', route.title);
  html = setMeta(html, 'property', 'og:description', route.description);
  html = setMeta(html, 'property', 'og:type', route.type);
  html = setMeta(html, 'property', 'og:url', canonical);
  html = setMeta(html, 'name', 'twitter:title', route.title);
  html = setMeta(html, 'name', 'twitter:description', route.description);
  return html;
}

export const renderNotFound = (template: string) => setMeta(template, 'name', 'robots', 'noindex');

export function sitemapXml(routes: RouteHead[], base: string): string {
  const urls = routes.filter((route) => route.sitemap).map((route) =>
    `  <url><loc>${urlOf(base, route.path)}</loc>${route.lastmod ? `<lastmod>${route.lastmod}</lastmod>` : ''}</url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

export function robotsWithSitemap(robots: string, base: string): string {
  const line = `Sitemap: ${SITE}${base}sitemap.xml`;
  const rest = robots.split('\n').filter((entry) => !entry.startsWith('Sitemap:')).join('\n').replace(/\s+$/, '');
  return `${rest}\n\n${line}\n`;
}
