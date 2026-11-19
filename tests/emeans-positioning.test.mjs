import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

async function read(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('e-means is published as bounded research with the accepted V5 result', async () => {
  const portfolio = await read('src/data/portfolio.ts');
  const article = await read('src/content/e-means-reproduction-lab.md');

  assert.match(portfolio, /slug: 'e-means-reproduction-lab'.*kind: 'Research note'.*status: 'Published'/);
  assert.match(article, /10 paired seeds/);
  assert.match(article, /2\.55 times faster/);
  assert.match(article, /methodological and empirical novelty, not algorithmic novelty/);
  assert.match(article, /does not establish a universal CPU speedup/);
  assert.doesNotMatch(article, /I invented e-means|new e-means algorithm|general CPU speedup/);
});

test('e-means evidence plots are shipped with the site', async () => {
  await access(new URL('public/e-means/quality-by-time.png', root));
  await access(new URL('public/e-means/quality-by-epoch.png', root));
});
