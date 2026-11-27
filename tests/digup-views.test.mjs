import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';

// ADR-066: one note, three views, each its own Markdown file. The site is public, so the files must stay free of private details.
const root = new URL('../', import.meta.url);
const read = (p) => readFile(new URL(p, root), 'utf8');
const files = {
  public: 'src/content/digup-parse-experiment.md',
  'case-study': 'src/content/digup-parse-experiment-case-study.md',
  technical: 'src/content/digup-parse-experiment-technical.md',
};
// Private paths, the private projects used as test artifacts, their file names and the local evidence repo.
const forbidden = [/\/users\//i, /lekhni/i, /e-means/i, /sakethv7@/i, /ledger\.jsonl/i, /file:\/\//i, /localhost/i];

test('the record lists three views and the first is public', async () => {
  const portfolio = await read('src/data/portfolio.ts');
  const record = portfolio.match(/\{ slug: 'digup-parse-experiment'[\s\S]*?\] \},\n/)?.[0] ?? '';
  assert.match(record, /kind: 'Research note'.*status: 'Published'.*date: '2026-11-25'/s);
  const ids = [...record.matchAll(/\{ id: '([a-z-]+)', label: '[^']+', body: '([a-z-]+)' \}/g)];
  assert.deepEqual(ids.map((m) => m[1]), ['public', 'case-study', 'technical']);
  assert.equal(ids[0][2], 'digup-parse-experiment');
  const plain = record.match(/plain: '([^']+)'/)[1];
  assert.ok(plain.split(/\s+/).length <= 25, `plain sentence has ${plain.split(/\s+/).length} words`);
});

test('all three files exist and carry the result and the limits', async () => {
  const text = {};
  for (const [id, path] of Object.entries(files)) text[id] = await read(path);
  assert.match(text.public, /top three for 9 of my 10 questions/);
  assert.match(text.public, /I scored rank only/);
  assert.match(text.public, /one failing document/i);
  assert.match(text['case-study'], /top three for 9 of 10 frozen questions/);
  assert.match(text['case-study'], /scored rank only/);
  assert.match(text['case-study'], /One failing document gives no statistical claim/);
  assert.match(text['case-study'], /no person checked any page/i);
  assert.match(text.technical, /only rank was scored/);
  assert.match(text.technical, /n=1/);
  assert.match(text.technical, /4\.1 s/);
  assert.match(text.technical, /6\.3 s/);
  assert.match(text.technical, /did not re-run them/);
  for (const body of Object.values(text)) {
    assert.match(body, /synthetic/i);
    assert.match(body, /assistant/i);
    assert.doesNotMatch(body, /every number is right|all numbers present|I compared|I checked each/i);
  }
  assert.match(text['case-study'], /license/i);
  assert.match(text.technical, /license/i);
});

test('no note file holds a private path, project or file name', async () => {
  for (const [id, path] of Object.entries(files)) {
    const body = await read(path);
    for (const pattern of forbidden) assert.doesNotMatch(body, pattern, `${id} view matches ${pattern}`);
  }
});

test('the built output for the note holds no private string', async (t) => {
  const assets = new URL('dist/assets/', root);
  try { await access(assets); } catch { return t.skip('run `npm run build` first'); }
  // Only the chunks that hold a note body: each has one of these headings. The main bundle holds other projects' names on purpose.
  const markers = ['What this shows, and what it does not', 'Review of a02, page 6'];
  const scanned = [];
  for (const name of await readdir(assets)) {
    if (!name.endsWith('.js')) continue;
    const code = await readFile(new URL(name, assets), 'utf8');
    if (!markers.some((marker) => code.includes(marker))) continue;
    scanned.push(name);
    for (const pattern of forbidden) assert.doesNotMatch(code, pattern, `${name} matches ${pattern}`);
  }
  assert.ok(scanned.length >= 3, `expected 3 note chunks, found ${scanned.length}`);
  try {
    const page = await readFile(new URL('dist/writing/digup-parse-experiment/index.html', root), 'utf8');
    for (const pattern of forbidden) assert.doesNotMatch(page, pattern, `static route matches ${pattern}`);
  } catch { /* no static file yet */ }
});
