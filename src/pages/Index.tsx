import { ArrowRight, ExternalLink, Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PortfolioShell } from '@/components/PortfolioShell';
import { usePageTitle } from '@/hooks/usePageTitle';
import { ContactSection } from '@/components/ContactSection';
import { noteCounts, publications, work, type WorkItem } from '@/data/portfolio';
import { heroProof, homeRoleLine, stackLadder } from '@/data/proof';
import { resumeExperiences } from '@/data/experience';
import { StackRow, Thumb } from '@/components/CardParts';

// The three evaluation notes, in this order (ADR-057). Diagrams are local because only home uses them.
const researchSlugs = ['system-one-guard-for-rag', 'calibrate-your-llm-judge', 'retrieval-vs-generation-failures'];
const noteDiagrams: Record<string, NonNullable<WorkItem['diagram']>> = {
  'system-one-guard-for-rag': { src: 'diagrams/system-one-guard-flow.svg', alt: 'A question passes a fast guard and router before Gemini. A refused question never reaches Gemini', width: 900, height: 690 },
  'calibrate-your-llm-judge': { src: 'diagrams/judge-calibration-loop.svg', alt: 'Judge calibration loop: label a small set, tune the judge on one half, then report true positive and true negative rates on the held-out half', width: 900, height: 960 },
  'retrieval-vs-generation-failures': { src: 'diagrams/retrieval-vs-generation.svg', alt: 'Four outcomes from two questions: was the context good, and was the answer good. Each bad pair points to retrieval or generation', width: 900, height: 700 },
};

const Index = () => {
  usePageTitle();
  const featured = work.filter((item) => item.featured).slice(0, 3);
  const research = researchSlugs.map((slug) => publications.find((item) => item.slug === slug)).filter((item) => item?.status === 'Published');
  return <PortfolioShell>
    <section className={`hero editorial-section${heroProof.length > 0 ? ' hero-grid' : ''}`}>
      <div className="hero-copy">
        <p className="eyebrow">AI Evaluation & Data Engineer</p>
        <h1>Saketh Velidimalla</h1>
        <p className="hero-role-line">Data scientist building production AI evaluation and data systems <span aria-hidden="true">·</span> Python, SQL, PySpark, AWS</p>
        <p className="hero-thesis">I work on the data and evaluation behind a company AI assistant that about 140,000 employees can use. It is a RAG platform: it searches internal articles, then writes an answer. I write the ETL pipelines and build the reports and KPIs with the business. When an answer is wrong, I trace it to the step that failed: retrieval, ranking, generation or handoff.</p>
        <p className="hero-thesis hero-thesis-own">Outside work, I run my own tests on how AI agents read websites, and on how AI models behave on a laptop with limited memory and heat. Next, I am learning networking and embedded hardware.</p>
        {/* The stack ladder replaces the topic pills (ADR-054). Top rung is depth today, bottom rung is learning. */}
        <ol className="stack-ladder" aria-label="Where my work sits, from product down to hardware">
          {stackLadder.map((rung) => <li key={rung.layer} className={rung.mark === 'learning' ? 'is-learning' : undefined}>
            <span className="rung-layer">{rung.layer}</span>
            {rung.to ? <Link className="rung-work" to={rung.to}>{rung.work}</Link> : <span className="rung-work">{rung.work}</span>}
            {rung.mark && <span className="rung-mark">{rung.mark}</span>}
          </li>)}
        </ol>
        <div className="hero-links">
          {/* Scrolls rather than navigating: under HashRouter a bare #contact would be read as a route. */}
          <a className="primary-link" href="#contact" onClick={(event) => { event.preventDefault(); const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; document.getElementById('contact')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }}>Get in touch <ArrowRight /></a>
          <Link className="secondary-button" to="/resume">View résumé</Link>
          <a href="https://github.com/Sakethv7" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>
      {heroProof.length > 0 && <ul className="proof-list" aria-label="Evidence">
        {heroProof.map((card) => {
          const body = <>
            {card.image && <img className="proof-image" src={card.image.src} alt={card.image.alt} width={card.image.width} height={card.image.height} loading="lazy" />}
            <span className="proof-claim">{card.claim}</span>
            <span className="proof-evidence">{card.evidence}</span>
            <span className="proof-link">{card.linkLabel} {card.href ? <ExternalLink /> : <ArrowRight />}</span>
          </>;
          return <li key={card.id}>
            {card.to ? <Link className="proof-card" to={card.to}>{body}</Link> : <a className="proof-card" href={card.href} target="_blank" rel="noreferrer">{body}</a>}
          </li>;
        })}
      </ul>}
    </section>

    <section className="editorial-section experience-preview">
      <div className="section-heading">
        <div><p className="eyebrow">Experience</p><h2>Where I have worked</h2></div>
        <Link to="/experience">See my job history <ArrowRight /></Link>
      </div>
      <div className="experience-preview-list">
        {/* The current role shows its own home sentence, so the user count stays in the hero only (ADR-055). */}
        {resumeExperiences.slice(0, 3).map((item) => <article key={item.id}>
          <time>{item.period}</time><div><h3>{item.title}</h3><p>{item.company}</p>{item.current && <p className="experience-preview-evidence">{homeRoleLine}</p>}</div>
        </article>)}
      </div>
    </section>

    <section className="editorial-section">
      <div className="section-heading">
        <div><p className="eyebrow">Selected work</p><h2>Three projects worth opening</h2></div>
        <Link to="/work">View the full archive <ArrowRight /></Link>
      </div>
      <div className="featured-grid">
        {featured.map((item) => <article className="featured-card" key={item.slug}>
          {item.evidenceStatus && <p className="evidence-status">{item.evidenceStatus}</p>}<h3>{item.title}</h3><p className="plain-line">{item.plain}</p>
          {item.diagram && <Thumb diagram={item.diagram} />}
          <p className="for-engineers"><span>Technical scope</span>{item.summary}</p>
          <StackRow stack={item.stack} />
          {item.results && item.proofLink && <figure className="results-block">
            {/* On-site findings link to the case study section (ADR-061). An outside source keeps its file name. */}
            <figcaption>{item.proofLink.to ? <Link to={item.proofLink.to}>From the seven findings <ArrowRight /></Link> : <a href={item.proofLink.href} target="_blank" rel="noreferrer">From FINDINGS.md <ExternalLink /></a>}</figcaption>
            {/* Each line is "label   values". The label gets its own column so the values can wrap in a narrow card. */}
            <dl>{item.results.map((line) => { const [, label = line, value = ''] = line.match(/^(\S.*?)\s{2,}(.*)$/) ?? []; return <div key={line}><dt>{label}</dt><dd>{value}</dd></div>; })}</dl>
          </figure>}
          <div className="card-links">
            {item.demo && <a href={item.demo} target="_blank" rel="noreferrer"><ExternalLink /> Live demo</a>}
            {item.github && <a href={item.github} target="_blank" rel="noreferrer"><Github /> Repository</a>}
            {item.proofLink?.href && <a href={item.proofLink.href} target="_blank" rel="noreferrer"><ExternalLink /> {item.proofLink.label}</a>}
            {item.proofLink?.to && <Link to={item.proofLink.to}><ArrowRight /> {item.proofLink.label}</Link>}
            {item.caseStudy && <Link to={`/work/${item.slug}`}><ArrowRight /> Case study</Link>}
            {item.private && !item.caseStudy && <span className="private-label">Private / case study forthcoming</span>}
          </div>
        </article>)}
      </div>
    </section>

    <section className="editorial-section">
      <div className="section-heading">
        <div><p className="eyebrow">Research</p><h2>How I find failures</h2></div>
        <Link to="/writing?kind=research">All {noteCounts.research} research notes <ArrowRight /></Link>
      </div>
      <p className="section-intro">Each note describes one test of an AI system: what I ran, what I found, and what the result does not show.</p>
      <div className="featured-grid">
        {research.map((item) => <article className="featured-card" key={item!.slug}>
          <p className="evidence-status">{item!.kind} · {item!.date}</p><h3>{item!.title}</h3><p className="plain-line">{item!.plain}</p>
          {noteDiagrams[item!.slug] && <Thumb diagram={noteDiagrams[item!.slug]} />}
          <StackRow stack={item!.stack} />
          <div className="card-links"><Link to={`/writing/${item!.slug}`}><ArrowRight /> Read the note</Link></div>
        </article>)}
      </div>
      <p className="section-intro"><Link to="/writing">Browse all notes</Link>, or read the <Link to="/work/geo-agent-bench">GEO-agent-bench project overview</Link>.</p>
    </section>

    <ContactSection />
  </PortfolioShell>;
};

export default Index;
