import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

// Contracts for the curated Work page and the on-site GEO findings (ADR-060 to ADR-062, api.md invariants).
const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('every selected slug names a work record, five in all', async () => {
  const page = await read('src/pages/Work.tsx');
  const portfolio = await read('src/data/portfolio.ts');
  const slugs = [...page.match(/const selectedSlugs = \[([^\]]*)\]/)[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);

  assert.equal(slugs.length, 5);
  for (const slug of slugs) assert.ok(portfolio.split('\n').some((line) => line.includes(`{ slug: '${slug}'`) && line.includes('category:')), slug);
});

test('the GEO case study has the Seven findings heading that links point to', async () => {
  const overview = await read('src/content/geo-agent-bench-overview.md');
  const portfolio = await read('src/data/portfolio.ts');

  assert.match(overview, /^## Seven findings$/m);
  assert.equal((overview.match(/^\d\. \*\*/gm) ?? []).length >= 7, true);
  assert.match(portfolio, /to: '\/work\/geo-agent-bench\?section=seven-findings'/);
  assert.doesNotMatch(portfolio, /proofLink: \{[^}]*FINDINGS\.md/);
});

test('the old group name and the three ML records are gone, and repos point to GitHub', async () => {
  const portfolio = await read('src/data/portfolio.ts');

  assert.doesNotMatch(portfolio, /category: 'Creative builds'/);
  for (const slug of ['classical-ml-lab', 'ml-foundations', 'neurons-background']) assert.doesNotMatch(portfolio, new RegExp(`slug: '${slug}'`));
  const repos = [...portfolio.matchAll(/\{ label: '([^']+)', href: '([^']+)' \}/g)];
  assert.equal(repos.length, 3);
  for (const [, label, href] of repos) {
    assert.ok(label.length > 0);
    assert.match(href, /^https:\/\/github\.com\//);
  }
});

test('the commit chart and its files are gone', async () => {
  const work = await read('src/pages/Work.tsx');

  assert.doesNotMatch(work, /CommitChart|@\/data\/commits/);
  for (const file of ['src/components/CommitChart.tsx', 'src/data/commits.ts', 'scripts/update-commits.sh']) {
    await assert.rejects(access(new URL(file, root)), file);
  }
});

test('the Work header and its route description no longer promise a label on every entry', async () => {
  const work = await read('src/pages/Work.tsx');
  const routes = await read('scripts/routes.ts');

  assert.match(work, /Five projects that show how I find AI failures, then everything else I have built\./);
  assert.doesNotMatch(`${work}\n${routes}`, /Each entry says whether it is deployed work/);
});
