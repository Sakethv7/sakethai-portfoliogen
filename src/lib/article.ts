import { Marked } from 'marked';

export interface Heading { id: string; text: string; level: 2 | 3 }
export interface PreparedArticle { html: string; headings: Heading[]; minutes: number }

// Assumed reading speed. No source; the page label says "about" (ADR-042).
const WORDS_PER_MINUTE = 230;

const plainText = (markdown: string) => markdown.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[`*_~]/g, '').replace(/<[^>]+>/g, '').trim();
const slugify = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'section';

function countMinutes(markdown: string): number {
  const words = markdown.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

// One parse gives the HTML, the heading list and the word count, so the three cannot disagree.
// Section links carry the route because HashRouter reads a bare #id as a route (ADR-043).
export function prepareArticle(markdown: string, basePath: string): PreparedArticle {
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
        const href = `#${basePath}?section=${encodeURIComponent(id)}`;
        return `<h${depth} id="${id}">${inner} <a class="heading-anchor" href="${href}" aria-label="Link to this section">#</a></h${depth}>\n`;
      },
    },
  });
  return { html: marked.parse(body, { async: false }), headings, minutes: countMinutes(body) };
}
