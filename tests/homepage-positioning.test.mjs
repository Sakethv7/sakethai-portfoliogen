import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

async function read(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('homepage names the role applied for and keeps the recruiter stack line (ADR-053)', async () => {
  const homepage = await read('src/pages/Index.tsx');

  assert.match(homepage, /AI Evaluation & Data Engineer/);
  assert.doesNotMatch(homepage, /Applied AI Systems Engineer/);
  assert.match(homepage, /Data scientist building production AI evaluation and data systems/);
  assert.match(homepage, /Python, SQL, PySpark, AWS/);
});

test('the 140,000 figure shows in the hero only, and the current role uses its home sentence (ADR-055)', async () => {
  const homepage = await read('src/pages/Index.tsx');
  const proof = await read('src/data/proof.ts');

  assert.equal(homepage.match(/140,000/g)?.length, 1);
  assert.doesNotMatch(proof, /claim: '[^']*140,000|evidence: '[^']*140,000/);
  assert.match(homepage, /item\.current && <p className="experience-preview-evidence">\{homeRoleLine\}/);
  assert.doesNotMatch(homepage, /item\.caseStudy\.plain/);
});

test('the shipped list is gone from home (ADR-057)', async () => {
  const homepage = await read('src/pages/Index.tsx');

  assert.doesNotMatch(homepage, /Other work shipped/);
  assert.doesNotMatch(homepage, /activity-list/);
});
