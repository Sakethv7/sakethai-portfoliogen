import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Download, Github } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { PortfolioShell } from '@/components/PortfolioShell';
import { ArticleContents } from '@/components/ArticleContents';
import { endLinks, publications, work } from '@/data/portfolio';
import { prepareArticle } from '@/lib/article';
import { experiences } from '@/data/experience';
import NotFound from './NotFound';

// Each Markdown file becomes its own chunk, fetched only when its article opens.
const bodies = import.meta.glob<string>('../content/*.md', { query: '?raw', import: 'default' });

async function loadBody(slug: string): Promise<string | null> {
  const load = bodies[`../content/${slug}.md`];
  return load ? load() : null;
}

function findRecord(collection: 'work' | 'writing' | 'experience', slug: string) {
  if (collection === 'experience') {
    const study = experiences.find((entry) => entry.caseStudy?.slug === slug)?.caseStudy;
    return study && { title: study.title, eyebrow: 'Case study · Experience', plain: study.plain, summary: study.summary, evidenceStatus: study.evidenceStatus, body: study.slug, github: undefined, back: ['/experience', 'Experience'] as const };
  }
  if (collection === 'work') {
    const item = work.find((entry) => entry.slug === slug && entry.caseStudy);
    return item && { title: item.title, eyebrow: 'Case study', plain: item.plain, summary: item.summary, body: item.caseStudy!, github: item.github, back: ['/work', 'Work archive'] as const };
  }
  // Planned posts are previewable in `vite dev` only (logic_flow.md, detail-page flow).
  const item = publications.find((entry) => entry.slug === slug && (entry.status === 'Published' || import.meta.env.DEV));
  return item && { title: item.title, eyebrow: [item.kind, item.date].filter(Boolean).join(' · '), plain: item.plain, summary: item.summary, body: item.slug, github: undefined, back: ['/writing', 'Writing'] as const };
}

export default function Article({ collection }: { collection: 'work' | 'writing' | 'experience' }) {
  const { slug = '' } = useParams();
  const record = findRecord(collection, slug);
  const body = record?.body;
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [params] = useSearchParams();
  const section = params.get('section');
  // The technical focus line starts folded on a phone, so the body starts higher (ADR-045).
  const [phone] = useState(() => window.matchMedia('(max-width: 560px)').matches);
  const basePath = `/${collection}/${slug}`;
  const prepared = useMemo(() => markdown === null ? null : prepareArticle(markdown, basePath), [markdown, basePath]);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!body) return;
    let active = true;
    setMarkdown(null);
    setMissing(false);
    loadBody(body)
      .then((markdown) => {
        if (!active) return;
        if (markdown === null) throw new Error(`No content file for ${body}`);
        // Content is committed to this repo, so the HTML is trusted (ADR-023).
        setMarkdown(markdown);
      })
      .catch((error) => {
        if (import.meta.env.DEV) console.error(error);
        if (active) setMissing(true);
      });
    return () => { active = false; };
  }, [body]);

  // A section link scrolls once the body exists. An id that matches no heading leaves the page at the top (ADR-043).
  useEffect(() => {
    if (!prepared || !section) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(section)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }, [prepared, section]);

  if (!record || missing) return <NotFound />;
  const ends = collection === 'writing' ? endLinks(slug) : null;

  return <PortfolioShell>
    <article className="article-page">
      <div className="reading-progress" aria-hidden="true" />
      <header className="page-header editorial-section article-header">
        <Link className="article-back" to={record.back[0]}><ArrowLeft /> {record.back[1]}</Link>
        <p className="eyebrow">{record.eyebrow}{prepared && ` · about ${prepared.minutes} min read`}</p>
        <h1>{record.title}</h1>
        <p className="plain-line">{record.plain}</p>
        {record.evidenceStatus && <p className="evidence-status">{record.evidenceStatus}</p>}
        <details className="for-engineers focus-fold" open={!phone}><summary>Technical focus</summary>{record.summary}</details>
        {record.github && <div className="hero-links"><a href={record.github} target="_blank" rel="noreferrer"><Github /> Repository</a></div>}
      </header>
      <div className="editorial-section article-layout">
        {prepared && <ArticleContents headings={prepared.headings} basePath={basePath} />}
        <div className="article-body" dangerouslySetInnerHTML={{ __html: prepared?.html ?? '' }} />
      </div>
      {ends && <nav className="editorial-section end-links" aria-label={ends.label}>
        <p className="eyebrow">{ends.label}</p>
        <ul>{ends.items.map((item) => <li key={item.slug}><Link to={`/writing/${item.slug}`}><span>{item.kind} · {item.date}</span><strong>{item.title}</strong><em>{item.plain}</em></Link></li>)}</ul>
      </nav>}
      {collection === 'experience' && <section className="editorial-section experience-cta"><div><p className="eyebrow">Next step</p><h2>Interested in the systems work?</h2><p>Use the résumé for the concise role history, or contact me to discuss the work that can be shared publicly.</p></div><div className="hero-links"><a className="primary-link" href={`${import.meta.env.BASE_URL}Saketh_Velidimalla_Resume.pdf`} download="Saketh_Velidimalla_Resume.pdf"><Download /> Download résumé</a><a href="mailto:sakethv7@gmail.com">Email</a></div></section>}
    </article>
  </PortfolioShell>;
}
