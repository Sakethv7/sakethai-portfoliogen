import { Marked } from 'marked';
import { countMinutes } from './readingTime.ts';

export interface Heading { id: string; text: string; level: 2 | 3 }
export interface PreparedArticle { html: string; headings: Heading[]; minutes: number }

const plainText = (markdown: string) => markdown.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[`*_~]/g, '').replace(/<[^>]+>/g, '').trim();
const slugify = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'section';

// One parse gives the HTML, the heading list and the word count, so the three cannot disagree.
// Section links are real paths with ?section=<id> (ADR-043, ADR-047). Old `#/path` links in the
// Markdown are rewritten to `<siteBase>path/`. `siteBase` is the Vite base and ends with a slash.
const escapeAttr = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
export function siteHref(siteBase: string, route: string): string {
  const [path, query] = route.replace(/^\/+/, '').split('?');
  const clean = path.replace(/\/+$/, '');
  return `${siteBase}${clean ? `${clean}/` : ''}${query ? `?${query}` : ''}`;
}

export function prepareArticle(markdown: string, basePath: string, siteBase = '/'): PreparedArticle {
  const body = markdown.replace(/^# .*\n+/, '');
  const headings: Heading[] = [];
  const used = new Map<string, number>();
  const marked = new Marked({
    renderer: {
      heading({ tokens, text, depth }) {
        const inner = this.parser.parseInline(tokens);
        if (depth !== 2 && depth !== 3) return `<h${depth}>${inner}</h${depth}>\n`;
        const base = slugify(plainText(text));
        const seen = (used.get(base) ?? 0) + 1;
        used.set(base, seen);
        const id = seen === 1 ? base : `${base}-${seen}`;
        headings.push({ id, text: plainText(text), level: depth });
        const href = siteHref(siteBase, `${basePath}?section=${encodeURIComponent(id)}`);
        return `<h${depth} id="${id}">${inner} <a class="heading-anchor" href="${href}" aria-label="Link to this section">#</a></h${depth}>\n`;
      },
      link({ href, title, tokens }) {
        const target = href.startsWith('#/') ? siteHref(siteBase, href.slice(1)) : href;
        const titleAttr = title ? ` title="${escapeAttr(title)}"` : '';
        return `<a href="${escapeAttr(target)}"${titleAttr}>${this.parser.parseInline(tokens)}</a>`;
      },
    },
  });
  // Notes use paths such as diagrams/x.svg. They worked from the site root. A note page is now
  // /writing/<slug>/, so a relative path would break. Point each one at the site base instead.
  const html = marked.parse(body, { async: false }).replace(/(\s(?:src|href))="(?!\/|#|[a-z][a-z0-9+.-]*:)([^"]*)"/gi, (_, attr, url) => `${attr}="${siteBase}${url}"`);
  return { html, headings, minutes: countMinutes(body) };
}
