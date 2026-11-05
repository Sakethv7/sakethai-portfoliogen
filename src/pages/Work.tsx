import { ArrowRight, ExternalLink, Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CommitChart } from '@/components/CommitChart';
import { PortfolioShell } from '@/components/PortfolioShell';
import { publications, work, workCategories } from '@/data/portfolio';

// These groups are real work but not the first thing to read, so they start folded (ADR-037).
const folded = ['Experiments & learning', 'Creative builds'];

export default function Work() {
  return <PortfolioShell>
    <header className="page-header editorial-section"><p className="eyebrow">Work archive</p><h1>Systems, tools, and experiments</h1><p>Production-facing systems, developer tools and experiments. Each entry says whether it is deployed work, a prototype or learning work. The notes on a project are listed with it.</p></header>
    {workCategories.map((category) => {
      const heading = <div className="archive-heading"><h2>{category}</h2><span>{work.filter((item) => item.category === category).length}</span></div>;
      const list = <div className="archive-list">{work.filter((item) => item.category === category).map((item) => <article key={item.slug}>
        <div className="archive-copy">{item.evidenceStatus && <p className="evidence-status">{item.evidenceStatus}</p>}<h3>{item.title}</h3><p className="plain-line">{item.plain}</p><p className="for-engineers"><span>Technical scope</span>{item.summary}</p><div className="tag-row">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>{item.notes && <p className="note-links"><span>{item.notes.length} notes</span>{item.notes.map((slug) => publications.find((entry) => entry.slug === slug)).filter((entry) => entry?.status === 'Published').map((entry) => <Link key={entry!.slug} to={`/writing/${entry!.slug}`}>{entry!.title}</Link>)}</p>}</div>
        <div className="archive-links">
          {item.updated && <time>Updated {item.updated}</time>}
          {item.github && <a href={item.github} target="_blank" rel="noreferrer"><Github /> Code</a>}
          {item.demo && <a href={item.demo} target="_blank" rel="noreferrer"><ExternalLink /> Demo</a>}
          {item.caseStudy && <Link to={`/work/${item.slug}`}><ArrowRight /> Case study</Link>}
          {item.private && !item.caseStudy && <span>Private work</span>}
        </div>
      </article>)}</div>;
      return <section className="editorial-section archive-section" key={category}>
        {folded.includes(category) ? <details className="archive-fold"><summary>{heading}</summary>{list}</details> : <>{heading}{list}</>}
      </section>;
    })}
    <section className="editorial-section"><CommitChart /></section>
    <section className="editorial-section github-archive"><p>Older coursework, data-analysis projects, and forks remain available in the complete GitHub archive.</p><a className="primary-link" href="https://github.com/Sakethv7?tab=repositories" target="_blank" rel="noreferrer">All repositories <ExternalLink /></a></section>
  </PortfolioShell>;
}
