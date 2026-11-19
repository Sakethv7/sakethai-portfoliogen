// Vite glue for ADR-047 and ADR-048. After the bundle is written, write one HTML file per route,
// sitemap.xml, a Sitemap line in robots.txt, and 404.html. Any error fails the build, so the
// workflow stops before upload and the live site keeps the last good deploy.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { createServer, type Plugin } from 'vite';

import { buildRoutes, checkRoutes, fileOf, renderHtml, renderNotFound, robotsWithSitemap, sitemapXml, type SiteData } from './routes';

// Load the two data files with Vite's own loader. proof.ts is not loaded: it reads import.meta.env.DEV.
async function loadData(root: string): Promise<SiteData> {
  const server = await createServer({ root, configFile: false, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true } });
  try {
    const portfolio = await server.ssrLoadModule('/src/data/portfolio.ts');
    const experience = await server.ssrLoadModule('/src/data/experience.ts');
    return { work: portfolio.work, publications: portfolio.publications, experiences: experience.experiences };
  } finally {
    await server.close();
  }
}

export function routeFiles(): Plugin {
  let base = '/';
  let root = process.cwd();
  let outDir = resolve(root, 'dist');
  return {
    name: 'route-files',
    apply: 'build',
    configResolved(config) {
      base = config.base;
      root = config.root;
      outDir = resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      const routes = buildRoutes(await loadData(root));
      const markdown = new Set(readdirSync(join(root, 'src/content')).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)));
      const { errors, warnings } = checkRoutes(routes, markdown);
      warnings.forEach((line) => console.warn(line));
      if (errors.length) throw new Error(errors.join('\n'));

      const template = readFileSync(join(outDir, 'index.html'), 'utf8');
      for (const route of routes) {
        const file = join(outDir, fileOf(route.path));
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, renderHtml(template, route, base));
      }
      writeFileSync(join(outDir, '404.html'), renderNotFound(template));
      writeFileSync(join(outDir, 'sitemap.xml'), sitemapXml(routes, base));
      const robots = join(outDir, 'robots.txt');
      writeFileSync(robots, robotsWithSitemap(readFileSync(robots, 'utf8'), base));

      const missing = routes.filter((route) => { try { readFileSync(join(outDir, fileOf(route.path))); return false; } catch { return true; } });
      if (missing.length) throw new Error(`prerender: route count ${routes.length} does not match file count ${routes.length - missing.length}`);
      console.log(`prerender: wrote ${routes.length} route files, sitemap.xml and 404.html`);
    },
  };
}
