// Reading time of every note, by slug (ADR-049). Pure, so `node --test` can run it.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { noteMinutes } from '../src/lib/readingTime.ts';

export function readingTimes(contentDir: string): Record<string, number> {
  const times: Record<string, number> = {};
  for (const file of readdirSync(contentDir).filter((name) => name.endsWith('.md'))) {
    times[file.slice(0, -3)] = noteMinutes(readFileSync(join(contentDir, file), 'utf8'));
  }
  return times;
}
