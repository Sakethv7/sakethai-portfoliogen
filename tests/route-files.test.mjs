import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import test from 'node:test';

import { buildRoutes, checkRoutes, fileOf, renderHtml, renderNotFound, robotsWithSitemap, sitemapXml } from '../scripts/routes.ts';
import { publications, work } from '../src/data/portfolio.ts';
import { experiences } from '../src/data/experience.ts';

const base = '/sakethai-portfoliogen/';
const data = { work, publications, experiences };
const routes = buildRoutes(data);
const template = '<html><head><title>Home</title><meta name="description" content="home" /><link rel="canonical" href="https://x/" /></head><body></body></html>';

test('one route per page, per case study and per published note (ADR-047)', () => {
  const published = publications.filter((p) => p.status === 'Published').length;
  const caseStudies = work.filter((w) => w.caseStudy).length + experiences.filter((e) => e.caseStudy).length;
  assert.equal(routes.length, 6 + caseStudies + published + 2); // + 2 merged-note redirects (ADR-065)
  assert.equal(new Set(routes.map((r) => r.path)).size, routes.length);
  assert.ok(routes.every((r) => r.path.startsWith('/') && r.path.endsWith('/')));
  assert.equal(fileOf('/'), 'index.html');
  assert.equal(fileOf('/writing/x/'), 'writing/x/index.html');
});

test('merged notes keep their old address and point to the note they joined (ADR-065)', () => {
  for (const [from, to] of [['review-gated-knowledge-system', 'sakethwiki-system-design'], ['lekhni-recording-to-knowledge', 'lekhni-system-design']]) {
    const route = routes.find((r) => r.path === `/writing/${from}/`);
    assert.ok(route, from);
    assert.equal(route.sitemap, false);
    assert.equal(route.canonicalPath, `/writing/${to}/`);
    assert.ok(publications.some((p) => p.slug === to && p.status === 'Published'), to);
  }
});

test('planned and in-progress records get no route', () => {
  for (const note of publications.filter((p) => p.status !== 'Published')) {
    assert.ok(!routes.some((r) => r.path === `/writing/${note.slug}/`), note.slug);
  }
});

test('every route with a Markdown body has its file, and descriptions fit', async () => {
  const slugs = new Set((await readdir(new URL('../src/content/', import.meta.url))).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)));
  const { errors } = checkRoutes(routes, slugs);
  assert.deepEqual(errors, []);
});

test('check fails on a missing note file and a description over 200 characters', () => {
  const bad = [
    { path: '/a/', title: 't', description: 'ok', type: 'article', sitemap: true, body: 'nope' },
    { path: '/b/', title: 't', description: 'x'.repeat(201), type: 'website', sitemap: true },
    { path: '/c/', title: 't', description: 'x'.repeat(170), type: 'website', sitemap: true },
  ];
  const { errors, warnings } = checkRoutes(bad, new Set());
  assert.equal(errors.length, 2);
  assert.match(errors[0], /missing note file for slug "nope"/);
  assert.match(errors[1], /description too long \(201 characters\)/);
  assert.equal(warnings.length, 1);
});

test('head tags are replaced once, never added twice', () => {
  const route = routes.find((r) => r.path === '/writing/system-one-guard-for-rag/');
  const html = renderHtml(renderHtml(template, route, base), route, base);
  assert.equal(html.match(/<title>/g).length, 1);
  assert.equal(html.match(/rel="canonical"/g).length, 1);
  for (const key of ['description', 'og:title', 'og:description', 'og:url', 'og:type', 'twitter:title', 'twitter:description']) {
    assert.equal(html.match(new RegExp(`="${key}"`, 'g')).length, 1, key);
  }
  assert.match(html, /href="https:\/\/sakethv7.github.io\/sakethai-portfoliogen\/writing\/system-one-guard-for-rag\/"/);
  assert.match(html, /og:type" content="article"/);
});

test('home keeps its hand-written head, and 404 gets noindex', () => {
  const home = renderHtml(template, routes.find((r) => r.path === '/'), base);
  assert.match(home, /<title>Home<\/title>/);
  assert.match(renderNotFound(template), /name="robots" content="noindex"/);
});

test('/research points its canonical at /writing/ and stays out of the sitemap', () => {
  const research = routes.find((r) => r.path === '/research/');
  assert.match(renderHtml(template, research, base), /canonical" href="https:\/\/sakethv7.github.io\/sakethai-portfoliogen\/writing\/"/);
  const xml = sitemapXml(routes, base);
  assert.ok(!xml.includes('/research/'));
  assert.equal((xml.match(/<url>/g) ?? []).length, routes.filter((r) => r.sitemap).length);
});

test('robots.txt gets one Sitemap line, even when run twice', () => {
  const once = robotsWithSitemap('User-agent: *\nAllow: /\n', base);
  const twice = robotsWithSitemap(once, base);
  assert.equal(twice.match(/^Sitemap:/gm).length, 1);
  assert.match(twice, /Sitemap: https:\/\/sakethv7.github.io\/sakethai-portfoliogen\/sitemap.xml/);
});

test('tags: 2 to 4 per published note, no two differ only by case (ADR-049)', () => {
  const all = new Map();
  for (const note of publications.filter((p) => p.status === 'Published')) {
    assert.ok(note.tags && note.tags.length >= 2 && note.tags.length <= 4, note.slug);
    for (const tag of note.tags) {
      const key = tag.toLowerCase();
      assert.equal(all.get(key) ?? tag, tag, `tag "${tag}" is also written another way`);
      all.set(key, tag);
    }
  }
});

test('pins: at most three, unique, from 1 to 3, all published', () => {
  const pinned = publications.filter((p) => p.pin !== undefined);
  assert.ok(pinned.length <= 3);
  assert.equal(new Set(pinned.map((p) => p.pin)).size, pinned.length);
  for (const note of pinned) {
    assert.ok([1, 2, 3].includes(note.pin), note.slug);
    assert.equal(note.status, 'Published', note.slug);
  }
});

test('card read time equals the note page read time for every note (ADR-049)', async () => {
  const { readingTimes } = await import('../scripts/readingTimes.ts');
  const { prepareArticle } = await import('../src/lib/article.ts');
  const { readFile } = await import('node:fs/promises');
  const dir = new URL('../src/content/', import.meta.url);
  const times = readingTimes(dir.pathname);
  assert.ok(Object.keys(times).length >= 30);
  for (const [slug, minutes] of Object.entries(times)) {
    assert.ok(minutes >= 1, slug);
    assert.equal(minutes, prepareArticle(await readFile(new URL(`${slug}.md`, dir), 'utf8'), `/writing/${slug}`).minutes, slug);
  }
});
