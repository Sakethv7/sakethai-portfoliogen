import { ExternalLink, Github } from 'lucide-react';
import { PortfolioShell } from '@/components/PortfolioShell';
import { work, workCategories } from '@/data/portfolio';

export default function Work() {
  return <PortfolioShell>
    <header className="page-header editorial-section"><p className="eyebrow">Work archive</p><h1>Systems, tools, and experiments</h1><p>Flagship systems come first. The broader archive preserves the learning trail without pretending every repository carries the same weight.</p></header>
    {workCategories.map((category) => <section className="editorial-section archive-section" key={category}>
      <div className="archive-heading"><h2>{category}</h2><span>{work.filter((item) => item.category === category).length}</span></div>
      <div className="archive-list">{work.filter((item) => item.category === category).map((item) => <article key={item.slug}>
        <div className="archive-copy"><h3>{item.title}</h3><p>{item.summary}</p><div className="tag-row">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
        <div className="archive-links">
          {item.updated && <time>Updated {item.updated}</time>}
          {item.github && <a href={item.github} target="_blank" rel="noreferrer"><Github /> Code</a>}
          {item.demo && <a href={item.demo} target="_blank" rel="noreferrer"><ExternalLink /> Demo</a>}
          {item.private && <span>Private work</span>}
        </div>
      </article>)}</div>
    </section>)}
    <section className="editorial-section github-archive"><p>Older coursework, data-analysis projects, and forks remain available in the complete GitHub archive.</p><a className="primary-link" href="https://github.com/Sakethv7?tab=repositories" target="_blank" rel="noreferrer">All repositories <ExternalLink /></a></section>
  </PortfolioShell>;
}
