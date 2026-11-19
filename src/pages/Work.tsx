import { ArrowRight, ExternalLink, Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PortfolioShell } from '@/components/PortfolioShell';
import { StackRow, Thumb } from '@/components/CardParts';
import { usePageTitle } from '@/hooks/usePageTitle';
import { publications, work, workCategories, type WorkItem } from '@/data/portfolio';

// The five projects that back the home page claim, in this order (ADR-060). Everything else is the archive.
const selectedSlugs = ['geo-agent-bench', 'rag-mini', 'sakethwiki', 'lekhni', 'sdlc-intelligence-agent'];

function publishedNotes(item: WorkItem) {
  return (item.notes ?? []).map((slug) => publications.find((entry) => entry.slug === slug)).filter((entry) => entry?.status === 'Published').map((entry) => entry!);
}

function SelectedCard({ item }: { item: WorkItem }) {
  const notes = publishedNotes(item);
  const noteLink = (note: (typeof notes)[number]) => <Link key={note.slug} to={`/writing/${note.slug}`}>{note.title}</Link>;
  return <article className="selected-card">
    <div className="selected-copy">
      {item.evidenceStatus && <p className="evidence-status">{item.evidenceStatus}</p>}
      <h3>{item.title}</h3>
      <p className="plain-line">{item.plain}</p>
      <p className="for-engineers"><span>Technical scope</span>{item.summary}</p>
      <StackRow stack={item.stack} />
      {notes.length > 0 && <div className="note-links">
        <span>{notes.length === 1 ? '1 note' : `${notes.length} notes`}</span>
        {notes.slice(0, 2).map(noteLink)}
        {/* Two notes show. The rest fold, so a project with ten notes stays one card tall (ADR-060). */}
        {notes.length > 2 && <details><summary>{notes.length - 2} more</summary>{notes.slice(2).map(noteLink)}</details>}
      </div>}
      <div className="card-links">
        {item.demo && <a href={item.demo} target="_blank" rel="noreferrer"><ExternalLink /> Live demo{item.demoNote && <span className="demo-note"> ({item.demoNote})</span>}</a>}
        {item.github && <a href={item.github} target="_blank" rel="noreferrer"><Github /> {item.private ? 'Repository' : 'Code'}</a>}
        {item.proofLink?.to && <Link to={item.proofLink.to}><ArrowRight /> {item.proofLink.label}</Link>}
        {item.proofLink?.href && <a href={item.proofLink.href} target="_blank" rel="noreferrer"><ExternalLink /> {item.proofLink.label}</a>}
        {item.caseStudy && <Link to={`/work/${item.slug}`}><ArrowRight /> Case study</Link>}
      </div>
    </div>
    {item.diagram && <Thumb diagram={item.diagram} />}
  </article>;
}

function ArchiveLine({ item }: { item: WorkItem }) {
  return <li>
    <div><h3>{item.title}</h3><p>{item.plain}</p></div>
    <div className="archive-line-links">
      {item.github && <a href={item.github} target="_blank" rel="noreferrer"><Github /> Code</a>}
      {item.repos?.map((repo) => <a key={repo.href} href={repo.href} target="_blank" rel="noreferrer"><Github /> {repo.label}</a>)}
      {item.demo && <a href={item.demo} target="_blank" rel="noreferrer"><ExternalLink /> Demo</a>}
      {item.caseStudy && <Link to={`/work/${item.slug}`}><ArrowRight /> Case study</Link>}
      {item.private && !item.github && !item.caseStudy && <span>Private work</span>}
    </div>
  </li>;
}

export default function Work() {
  usePageTitle('Work archive');
  const selected = selectedSlugs.map((slug) => work.find((item) => item.slug === slug)).filter((item): item is WorkItem => item !== undefined);
  const rest = work.filter((item) => !selectedSlugs.includes(item.slug));
  return <PortfolioShell>
    <header className="page-header editorial-section"><p className="eyebrow">Work</p><h1>Systems, tools, and experiments</h1><p>Five projects that show how I find AI failures, then everything else I have built.</p></header>
    <section className="editorial-section">
      <div className="section-heading"><div><p className="eyebrow">Selected work</p><h2>Five projects</h2></div></div>
      <div className="selected-list">{selected.map((item) => <SelectedCard key={item.slug} item={item} />)}</div>
    </section>
    <section className="editorial-section archive-section">
      <div className="section-heading"><div><p className="eyebrow">Archive</p><h2>Everything else</h2></div></div>
      {workCategories.map((category) => {
        const items = rest.filter((item) => item.category === category);
        if (items.length === 0) return null;
        return <div className="archive-group" key={category}><h3 className="archive-group-heading">{category}</h3><ul className="archive-lines">{items.map((item) => <ArchiveLine key={item.slug} item={item} />)}</ul></div>;
      })}
    </section>
    <section className="editorial-section github-archive"><p>Older coursework, data-analysis projects, and forks remain available in the complete GitHub archive.</p><a className="primary-link" href="https://github.com/Sakethv7?tab=repositories" target="_blank" rel="noreferrer">All repositories <ExternalLink /></a></section>
  </PortfolioShell>;
}
