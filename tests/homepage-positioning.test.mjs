import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

async function read(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('homepage names the target role and recruiter stack without replacing the AI systems headline', async () => {
  const homepage = await read('src/pages/Index.tsx');

  assert.match(homepage, /Applied AI Systems Engineer/);
  assert.match(homepage, /Data scientist building production AI evaluation and data systems/);
  assert.match(homepage, /Python, SQL, PySpark, AWS/);
});

test('homepage reuses the current experience case-study evidence instead of duplicating a metric', async () => {
  const homepage = await read('src/pages/Index.tsx');

  assert.match(homepage, /item\.current && item\.caseStudy/);
  assert.match(homepage, /item\.caseStudy\.plain/);
  assert.doesNotMatch(homepage, /140,000 internal users · thousands of queries/);
});

test('non-GEO activity is labelled as work outside the research section', async () => {
  const homepage = await read('src/pages/Index.tsx');

  assert.match(homepage, /item\.series !== 'GEO agent benchmark'/);
  assert.match(homepage, /Outside this research/);
  assert.match(homepage, /Other work shipped/);
  assert.doesNotMatch(homepage, />Recent activity</);
});
