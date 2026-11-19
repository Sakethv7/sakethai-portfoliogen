import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

// Contracts for the home page thread (ADR-053 to ADR-058, api.md invariants).
const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

function ladderRungs(proof) {
  const block = proof.slice(proof.indexOf('export const stackLadder'));
  return [...block.slice(0, block.indexOf('];')).matchAll(/\{ layer: '(\w+)'[^\n]*\}/g)].map(([line, layer]) => ({
    layer,
    to: line.match(/to: '([^']+)'/)?.[1],
    mark: line.match(/mark: '([^']+)'/)?.[1],
  }));
}

test('the ladder has six rungs, depth today on top and learning at the bottom with no link', async () => {
  const rungs = ladderRungs(await read('src/data/proof.ts'));

  assert.deepEqual(rungs.map((rung) => rung.layer), ['Product', 'Agents', 'Models', 'Runtimes', 'Network', 'Hardware']);
  assert.equal(rungs[0].mark, 'depth today');
  assert.equal(rungs.at(-1).mark, 'learning');
  assert.equal(rungs.at(-1).to, undefined);
  assert.equal(rungs.filter((rung) => rung.mark === 'depth today').length, 1);
});

test('every ladder link points to a record that exists and is published', async () => {
  const rungs = ladderRungs(await read('src/data/proof.ts'));
  const portfolio = await read('src/data/portfolio.ts');
  const experience = await read('src/data/experience.ts');
  const lines = portfolio.split('\n');

  for (const { to } of rungs.filter((rung) => rung.to)) {
    const [, collection, slug] = to.split('/');
    if (collection === 'experience') {
      assert.match(experience, new RegExp(`slug: '${slug}'`), to);
    } else if (collection === 'work') {
      assert.ok(lines.some((line) => line.includes(`{ slug: '${slug}'`) && line.includes('category:')), to);
    } else if (collection === 'writing') {
      assert.ok(lines.some((line) => line.includes(`slug: '${slug}'`) && line.includes("status: 'Published'")), to);
    } else {
      assert.fail(`unknown route ${to}`);
    }
  }
});

test('every home diagram file exists', async () => {
  const sources = `${await read('src/data/portfolio.ts')}\n${await read('src/pages/Index.tsx')}`;
  const files = [...new Set([...sources.matchAll(/src: '(diagrams\/[\w-]+\.svg)'/g)].map((match) => match[1]))];

  assert.ok(files.length >= 6);
  for (const file of files) await access(new URL(`public/${file}`, root));
});

test('result lines are 80 characters or fewer, and at most three projects are featured', async () => {
  const portfolio = await read('src/data/portfolio.ts');
  const block = portfolio.slice(portfolio.indexOf('results: ['));
  const results = [...block.slice(0, block.indexOf(']')).matchAll(/'([^']+)'/g)].map((match) => match[1]);

  assert.ok(results.length >= 1 && results.length <= 4);
  for (const line of results) assert.ok(line.length <= 80, line);
  assert.ok((portfolio.match(/featured: true/g) ?? []).length <= 3);
});

test('home research shows the three evaluation notes, not e-means', async () => {
  const homepage = await read('src/pages/Index.tsx');

  assert.match(homepage, /\['system-one-guard-for-rag', 'calibrate-your-llm-judge', 'retrieval-vs-generation-failures'\]/);
  assert.doesNotMatch(homepage, /e-means-reproduction-lab/);
  assert.match(homepage, /How I find failures/);
});

test('the old title is gone from the home head and the title hook', async () => {
  const head = await read('index.html');
  const hook = await read('src/hooks/usePageTitle.ts');

  assert.doesNotMatch(`${head}\n${hook}`, /Applied AI Systems Engineer/);
  assert.match(head, /AI Evaluation &amp; Data Engineer/);
});
