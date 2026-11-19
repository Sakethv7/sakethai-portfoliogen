// A virtual module, `virtual:reading-times`, holds a { slug: minutes } map built from src/content.
// The list page imports it, so it never has to load every note. It rebuilds in dev when a note changes.
import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Plugin } from 'vite';

import { readingTimes } from './readingTimes';

const ID = 'virtual:reading-times';

export function readingTimesModule(): Plugin {
  let dir = resolve('src/content');
  return {
    name: 'reading-times',
    configResolved(config) { dir = join(config.root, 'src/content'); },
    resolveId(id) { return id === ID ? `\0${ID}` : null; },
    load(id) {
      if (id !== `\0${ID}`) return null;
      readdirSync(dir).filter((name) => name.endsWith('.md')).forEach((name) => this.addWatchFile(join(dir, name)));
      return `export default ${JSON.stringify(readingTimes(dir))};`;
    },
  };
}
