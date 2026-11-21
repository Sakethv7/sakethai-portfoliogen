import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (p) => readFile(new URL(p, root), 'utf8');

test('goal-contract note is published with its result and its limits (ADR-063)', async () => {
  const portfolio = await read('src/data/portfolio.ts');
  const article = await read('src/content/goal-contract-experiment.md');
  assert.match(portfolio, /slug: 'goal-contract-experiment'.*kind: 'Research note'.*status: 'Published'/);
  assert.match(article, /81 valid runs/);
  assert.match(article, /17 of 24 runs/);
  assert.match(article, /Claude Haiku/);
  assert.match(article, /pilot, not proof/);
  assert.match(article, /no reminder/);
  assert.match(article, /github\.com\/Sakethv7\/goal-contract-experiment/);
});

test('goal-contract chart is shipped with the site', async () => {
  await access(new URL('public/goal-contract/sweep.svg', root));
});
