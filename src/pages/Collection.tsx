import { Link, useSearchParams } from 'react-router-dom';
import { PortfolioShell } from '@/components/PortfolioShell';
import { publications, work } from '@/data/portfolio';
import type { PublicationItem } from '@/data/portfolio';

const description = 'Notes on evaluating, operating, and debugging AI systems. Research notes cite their sources, and my own reading is labelled.';

// The `kind` value in the address maps to a publication kind (ADR-034).
const kinds: Record<string, { label: string; kind: PublicationItem['kind'] }> = {
  engineering: { label: 'Engineering', kind: 'Engineering note' },
  research: { label: 'Research', kind: 'Research note' },
  'system-design': { label: 'System design', kind: 'System design' },
  'build-log': { label: 'Build logs', kind: 'Build log' },
};

// A series groups the notes of one project into one card. Its overview page is the project's case study.
const seriesInfo: Record<string, { to: string; plain: string }> = {
  'GEO agent benchmark': { to: '/work/geo-agent-bench', plain: 'Test sites, a request log and a scorer that measure how AI agents behave when a website changes its format, who they say they are, and how they sign in. One note per phase, in order.' },
};

type Entry = { kind: 'note'; item: PublicationItem } | { kind: 'series'; name: string; chapters: PublicationItem[] };

// Chapters follow the order of the project's `notes` list in portfolio.ts, so the card matches the overview page.
function chapterRank(name: string, item: PublicationItem): number {
  const order = work.find((entry) => seriesInfo[name].to.endsWith(`/${entry.slug}`))?.notes ?? [];
  const index = order.indexOf(item.slug);
  return index === -1 ? order.length : index;
}

function toEntries(notes: PublicationItem[]): Entry[] {
  const loose: Entry[] = notes.filter((item) => !item.series).map((item) => ({ kind: 'note', item }));
  const names = [...new Set(notes.filter((item) => item.series).map((item) => item.series!))];
  const groups: Entry[] = names.map((name) => ({ kind: 'series', name, chapters: notes.filter((item) => item.series === name).toSorted((a, b) => chapterRank(name, a) - chapterRank(name, b)) }));
  return [...loose, ...groups];
}

const entryDate = (entry: Entry) => entry.kind === 'note' ? entry.item.date! : entry.chapters[entry.chapters.length - 1].date!;

export default function Collection() {
  const [params] = useSearchParams();
  // An unknown `kind` value falls back to All.
  const active = kinds[params.get('kind') ?? ''] ? params.get('kind')! : '';
  // Only published work is public; planned items show in `vite dev` so drafts can be previewed.
  const visible = publications.filter((item) => item.status === 'Published' || import.meta.env.DEV);
  const notes = active ? visible.filter((item) => item.kind === kinds[active].kind) : visible;
  const items = toEntries(notes).toSorted((a, b) => entryDate(b).localeCompare(entryDate(a)));
  // A chip shows only when its kind has a note.
  const chips = [['', 'All'], ...Object.entries(kinds).filter(([, { kind }]) => visible.some((item) => item.kind === kind)).map(([key, { label }]) => [key, label])];
  return <PortfolioShell>
    <header className="page-header editorial-section"><p className="eyebrow">Public work</p><h1>Writing</h1><p>{description}</p>
      <nav className="filter-chips" aria-label="Filter notes by kind">{chips.map(([key, label]) => <Link key={key} to={key ? `/writing?kind=${key}` : '/writing'} aria-current={key === active ? 'true' : undefined}>{label}</Link>)}</nav>
    </header>
    <section className="editorial-section collection-list">{items.length ? items.map((entry) => entry.kind === 'series' ? <article className="series-card" key={entry.name}>
      <div className="meta-line"><span>Project series · {entry.chapters.length} notes</span><span>{entryDate(entry)}</span></div>
      <h2><Link to={seriesInfo[entry.name].to}>{entry.name}</Link></h2>
      <p className="plain-line">{seriesInfo[entry.name].plain}</p>
      <ol className="series-chapters">{entry.chapters.map((chapter) => <li key={chapter.slug}><time>{chapter.date}</time><Link to={`/writing/${chapter.slug}`}>{chapter.title}</Link></li>)}</ol>
      <p className="series-link"><Link to={seriesInfo[entry.name].to}>Read the project overview</Link></p>
    </article> : <article key={entry.item.title}>
      <div className="meta-line"><span>{entry.item.kind}</span><span>{entry.item.status === 'Published' ? entry.item.date : entry.item.status}</span></div><h2>{entry.item.status === 'Published' ? <Link to={`/writing/${entry.item.slug}`}>{entry.item.title}</Link> : entry.item.title}</h2><p className="plain-line">{entry.item.plain}</p><p className="for-engineers"><span>Technical focus</span>{entry.item.summary}</p>
    </article>) : <div className="honest-empty"><p className="eyebrow">Nothing published yet</p><h2>This shelf starts empty on purpose.</h2><p>New notes will appear here only when there is a real, dated artifact to read.</p></div>}</section>
  </PortfolioShell>;
}
