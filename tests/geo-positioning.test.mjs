import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

async function read(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('GEO overview states the three surfaces and the benchmark limit', async () => {
  const overview = await read('src/content/geo-agent-bench-overview.md');

  assert.match(overview, /legacy HTML built for people/);
  assert.match(overview, /agent-readable sites with `llms\.txt` and markdown copies/);
  assert.match(overview, /agent-native interfaces built from MCP tools or identity-aware responses/);
  assert.match(overview, /not yet a general benchmark of GEO effectiveness/);
});

test('public summary keeps agent runs separate from crawler evidence', async () => {
  const portfolio = await read('src/data/portfolio.ts');

  assert.match(portfolio, /Qwen and Claude agent runs/);
  assert.match(portfolio, /observed Anthropic and OpenAI crawler traffic/);
  assert.doesNotMatch(portfolio, /Qwen crawler/);
  assert.doesNotMatch(portfolio, /GPT agent runs/);
});

test('Phase E copy states the 24 plus 8 run structure without reversing the initial failure', async () => {
  const portfolio = await read('src/data/portfolio.ts');
  const phaseE = await read('src/content/geo-agent-bench-phase-e.md');

  assert.match(portfolio, /24 initial runs plus an 8-run corrected rerun/);
  assert.match(phaseE, /24 initial cells/);
  assert.match(phaseE, /32 runs total/);
  assert.doesNotMatch(`${portfolio}\n${phaseE}`, /failed 0 of 8|32 runs, one per task and version/);
});

test('homepage evidence calls GEO an experimental harness instead of a general benchmark', async () => {
  const proof = await read('src/data/proof.ts');

  assert.match(proof, /An experimental harness/);
  assert.doesNotMatch(proof, /A benchmark of how AI agents behave/);
});
