import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import test from 'node:test';

import { prepareArticle } from '../src/lib/article.ts';
import { endLinks, publications, work } from '../src/data/portfolio.ts';

const root = new URL('../', import.meta.url);
const base = '/writing/demo';

test('headings get unique ids, a section link, and appear in the list', () => {
  const md = '# Title\n\nIntro.\n\n## The setup\n\ntext\n\n### Detail\n\n## The setup\n\n## ???\n\n## ???\n';
  const { html, headings } = prepareArticle(md, base);
  assert.deepEqual(headings.map((h) => h.id), ['the-setup', 'detail', 'the-setup-2', 'section', 'section-2']);
  assert.deepEqual(headings.map((h) => h.level), [2, 3, 2, 2, 2]);
  assert.equal(headings[0].text, 'The setup');
  assert.match(html, /<h2 id="the-setup">The setup <a class="heading-anchor" href="\/writing\/demo\/\?section=the-setup"/);
  assert.doesNotMatch(html, /<h1/);
});

test('h4 and deeper headings are not listed', () => {
  const { headings } = prepareArticle('## A\n\n#### Deep\n', base);
  assert.deepEqual(headings.map((h) => h.id), ['a']);
});

test('reading time is at least 1 minute and skips code blocks', () => {
  assert.equal(prepareArticle('Short.', base).minutes, 1);
  const words = Array(460).fill('word').join(' ');
  assert.equal(prepareArticle(words, base).minutes, 2);
  const code = '```\n' + Array(5000).fill('x').join(' ') + '\n```\n\nShort.';
  assert.equal(prepareArticle(code, base).minutes, 1);
});

test('heading text is escaped inside the link attribute', () => {
  const { html } = prepareArticle('## A "quoted" <b>\n', base);
  assert.doesNotMatch(html, /href="[^"]*"[^>]*"quoted"/);
});

test('prepareArticle is pure', () => {
  const md = '## One\n\n## Two\n';
  assert.deepEqual(prepareArticle(md, base), prepareArticle(md, base));
});

const published = publications.filter((p) => p.status === 'Published');

test('endLinks: series note points to the next chapter, last points back', () => {
  const order = work.find((w) => w.slug === 'geo-agent-bench').notes.filter((s) => published.some((p) => p.slug === s && p.series));
  assert.ok(order.length >= 2);
  const first = endLinks(order[0]);
  assert.equal(first.label, 'Next in this series');
  assert.equal(first.items[0].slug, order[1]);
  const last = endLinks(order[order.length - 1]);
  assert.equal(last.label, 'Next in this series');
  assert.equal(last.items[0].slug, order[order.length - 2]);
});

test('endLinks: other notes get 2 other published notes, never themselves', () => {
  const loose = published.find((p) => !work.some((w) => w.notes?.includes(p.slug)));
  const result = endLinks(loose.slug);
  assert.equal(result.label, 'More notes');
  assert.equal(result.items.length, 2);
  assert.ok(result.items.every((i) => i.slug !== loose.slug && i.status === 'Published'));
});

test('endLinks: unknown slug returns null', () => {
  assert.equal(endLinks('no-such-note'), null);
});

test('every figure names an existing file and has alt, width and height', async () => {
  const files = (await readdir(new URL('src/content/', root))).filter((f) => f.endsWith('.md'));
  for (const file of files) {
    const text = await readFile(new URL(`src/content/${file}`, root), 'utf8');
    for (const img of text.match(/<img [^>]*>/g) ?? []) {
      const src = img.match(/src="([^"]+)"/)?.[1];
      if (!src?.startsWith('diagrams/')) continue;
      await access(new URL(`public/${src}`, root));
      assert.match(img, /alt="[^"]{12,}"/, `${file}: ${src} needs alt text that states the reading`);
      assert.match(img, /width="\d+"/, `${file}: ${src} needs width`);
      assert.match(img, /height="\d+"/, `${file}: ${src} needs height`);
    }
  }
});

test('old #/ links in Markdown become real paths and keep the query (ADR-047)', () => {
  const md = '[a](#/writing/x) [b](#/writing?kind=research) [c](https://example.com/p?q=1 "T")\n';
  const { html } = prepareArticle(md, base, '/site/');
  assert.match(html, /<a href="\/site\/writing\/x\/">a<\/a>/);
  assert.match(html, /<a href="\/site\/writing\/\?kind=research">b<\/a>/);
  assert.match(html, /<a href="https:\/\/example.com\/p\?q=1" title="T">c<\/a>/);
  assert.doesNotMatch(html, /href="#\//);
});

test('no published or Markdown note renders a #/ link', async () => {
  const dir = new URL('src/content/', root);
  for (const file of (await readdir(dir)).filter((f) => f.endsWith('.md'))) {
    const { html } = prepareArticle(await readFile(new URL(file, dir), 'utf8'), `/writing/${file}`, '/site/');
    assert.doesNotMatch(html, /href="#\//, file);
  }
});

test('relative figure and image paths point at the site base (ADR-047)', () => {
  const md = '<figure><a href="diagrams/x.svg"><img src="diagrams/x.svg" alt="a"></a></figure>\n\n![p](e-means/p.png)\n\n[m](mailto:a@b.c) [t](https://e.com/x)\n';
  const { html } = prepareArticle(md, base, '/site/');
  assert.match(html, /href="\/site\/diagrams\/x.svg"/);
  assert.match(html, /src="\/site\/diagrams\/x.svg"/);
  assert.match(html, /src="\/site\/e-means\/p.png"/);
  assert.match(html, /href="mailto:a@b.c"/);
  assert.match(html, /href="https:\/\/e.com\/x"/);
});

test('no note renders a relative src or href', async () => {
  const dir = new URL('src/content/', root);
  for (const file of (await readdir(dir)).filter((f) => f.endsWith('.md'))) {
    const { html } = prepareArticle(await readFile(new URL(file, dir), 'utf8'), `/writing/${file}`, '/site/');
    assert.doesNotMatch(html, /\s(?:src|href)="(?!\/|#|[a-z][a-z0-9+.-]*:)/i, file);
  }
});
