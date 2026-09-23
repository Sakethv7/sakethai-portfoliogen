import { useEffect, useState } from 'react';
import { ArrowLeft, Github } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { marked } from 'marked';
import { PortfolioShell } from '@/components/PortfolioShell';
import { publications, work } from '@/data/portfolio';
import NotFound from './NotFound';

// Each Markdown file becomes its own chunk, fetched only when its article opens.
const bodies = import.meta.glob<string>('../content/*.md', { query: '?raw', import: 'default' });

async function loadBody(slug: string): Promise<string | null> {
  const load = bodies[`../content/${slug}.md`];
  return load ? load() : null;
}

function findRecord(collection: 'work' | 'writing', slug: string) {
  if (collection === 'work') {
    const item = work.find((entry) => entry.slug === slug && entry.caseStudy);
    return item && { title: item.title, eyebrow: 'Case study', summary: item.summary, body: item.caseStudy!, github: item.github, back: ['/work', 'Work archive'] as const };
  }
  // Planned posts are previewable in `vite dev` only (logic_flow.md, detail-page flow).
  const item = publications.find((entry) => entry.slug === slug && (entry.status === 'Published' || import.meta.env.DEV));
  return item && { title: item.title, eyebrow: [item.kind, item.date].filter(Boolean).join(' · '), summary: item.summary, body: item.slug, github: undefined, back: ['/writing', 'Writing'] as const };
}

export default function Article({ collection }: { collection: 'work' | 'writing' }) {
  const { slug = '' } = useParams();
  const record = findRecord(collection, slug);
  const [html, setHtml] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!record) return;
    // HashRouter keeps the previous page's scroll position; articles must open at the top.
    window.scrollTo({ top: 0, behavior: 'instant' });
    let active = true;
    setHtml(null);
    setMissing(false);
    loadBody(record.body)
      .then((markdown) => {
        if (!active) return;
        if (markdown === null) throw new Error(`No content file for ${record.body}`);
        // Content is committed to this repo, so the HTML is trusted (ADR-023).
        setHtml(marked.parse(markdown, { async: false }));
      })
      .catch((error) => {
        if (import.meta.env.DEV) console.error(error);
        if (active) setMissing(true);
      });
    return () => { active = false; };
  }, [record?.body]);

  if (!record || missing) return <NotFound />;

  return <PortfolioShell>
    <article className="article-page">
      <header className="page-header editorial-section article-header">
        <Link className="article-back" to={record.back[0]}><ArrowLeft /> {record.back[1]}</Link>
        <p className="eyebrow">{record.eyebrow}</p>
        <h1>{record.title}</h1>
        <p>{record.summary}</p>
        {record.github && <div className="hero-links"><a href={record.github} target="_blank" rel="noreferrer"><Github /> Repository</a></div>}
      </header>
      <div className="editorial-section article-body" dangerouslySetInnerHTML={{ __html: html ?? '' }} />
    </article>
  </PortfolioShell>;
}
