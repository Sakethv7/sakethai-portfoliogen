import { ArrowRight, ExternalLink, Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PortfolioShell } from '@/components/PortfolioShell';
import { ContactSection } from '@/components/ContactSection';
import { activity, noteCounts, publications, work } from '@/data/portfolio';
import { heroProof } from '@/data/proof';
import { resumeExperiences } from '@/data/experience';

// Each topic opens the note or project that backs it. Hardware has no published artifact yet, so it links to the closest one.
const topics: [string, string][] = [
  ['Runtimes', '/writing/ollama-vs-mlx-benchmark'],
  ['LLM judges', '/writing/calibrate-your-llm-judge'],
  ['Pipelines', '/work/lekhni'],
  ['MCP', '/writing/geo-agent-bench-phase-b-c'],
  ['Small models', '/writing/choosing-local-qwen-models'],
  ['Networking and DNS', '/writing/geo-agent-bench-setup'],
  ['Security', '/writing/geo-agent-bench-signatures'],
  ['Hardware (learning)', '/work/agentic-maintenance'],
];

const Index = () => {
  // The Research block already covers the benchmark, so its releases stay off this list (ADR-035).
  const shipped = activity.filter((item) => item.series !== 'GEO agent benchmark').slice(0, 4);
  const featured = work.filter((item) => item.featured).slice(0, 3);
  const research = ['geo-agent-bench-phase-e', 'geo-agent-bench-phase-b-c', 'geo-agent-bench'].map((slug) => publications.find((item) => item.slug === slug)).filter((item) => item?.status === 'Published');
  return <PortfolioShell>
    <section className={`hero editorial-section${heroProof.length > 0 ? ' hero-grid' : ''}`}>
      <div className="hero-copy">
        <p className="eyebrow">Applied AI Systems Engineer</p>
        <h1>Saketh Velidimalla</h1>
        <p className="hero-role-line">Data scientist building production AI evaluation and data systems <span aria-hidden="true">·</span> Python, SQL, PySpark, AWS</p>
        <p className="hero-thesis">I build and measure AI systems. At work, I own evaluation, observability, guardrails and red-teaming for a production RAG platform used by about 140,000 employees. I trace each failure to retrieval, ranking, generation or handoff. I also design the data schemas, the pipelines and the KPIs, and I triage what misses them.</p>
        <p className="hero-thesis hero-thesis-own">On my own time, I test how AI systems behave and publish what I find. I benchmarked Ollama against MLX while reading chip power, heat and memory counters. I run my own test sites to study networking, DNS, web security and AI agent behavior. I am now learning hardware: ESP32, Arduino and robotics.</p>
        <ul className="topic-links" aria-label="Topics">
          {topics.map(([label, to]) => <li key={label}><Link to={to}>{label}</Link></li>)}
        </ul>
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
        {resumeExperiences.slice(0, 3).map((item) => <article key={item.id}>
          <time>{item.period}</time><div><h3>{item.title}</h3><p>{item.company}</p>{item.current && item.caseStudy && <p className="experience-preview-evidence">{item.caseStudy.plain}</p>}</div>
        </article>)}
      </div>
    </section>

    <section className="editorial-section">
      <div className="section-heading">
        <div><p className="eyebrow">Selected work</p><h2>Three projects worth opening</h2></div>
        <Link to="/work">View the full archive <ArrowRight /></Link>
      </div>
      <div className="featured-grid">
        {featured.map((item, index) => <article className="featured-card" key={item.slug}>
          <p className="item-index">0{index + 1}</p>{item.evidenceStatus && <p className="evidence-status">{item.evidenceStatus}</p>}<h3>{item.title}</h3><p className="plain-line">{item.plain}</p><p className="for-engineers"><span>Technical scope</span>{item.summary}</p>
          <div className="tag-row">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          <div className="card-links">
            {item.demo && <a href={item.demo} target="_blank" rel="noreferrer"><ExternalLink /> Live demo</a>}
            {item.github && <a href={item.github} target="_blank" rel="noreferrer"><Github /> Repository</a>}
            {item.caseStudy && <Link to={`/work/${item.slug}`}><ArrowRight /> Read the case study</Link>}
            {item.private && !item.caseStudy && <span className="private-label">Private / case study forthcoming</span>}
          </div>
        </article>)}
      </div>
    </section>

    <section className="editorial-section">
      <div className="section-heading">
        <div><p className="eyebrow">Research</p><h2>Measuring how AI agents use a website</h2></div>
        <Link to="/writing?kind=research">All {noteCounts.research} research notes <ArrowRight /></Link>
      </div>
      <p className="section-intro">One descriptive experimental harness across legacy, agent-readable and agent-native web surfaces. It measures navigation, instruction adherence, data exposure, identity and sign-in. Each note states its own limits.</p>
      <div className="featured-grid">
        {research.map((item, index) => <article className="featured-card" key={item!.slug}>
          <p className="item-index">0{index + 1}</p><p className="evidence-status">{item!.kind} · {item!.date}</p><h3>{item!.title}</h3><p className="plain-line">{item!.plain}</p>
          <div className="card-links"><Link to={`/writing/${item!.slug}`}><ArrowRight /> Read the note</Link></div>
        </article>)}
      </div>
      <p className="section-intro"><Link to="/work/geo-agent-bench">Read the project overview</Link>, <Link to="/writing">browse all notes</Link>, or open the <a href="https://github.com/Sakethv7/geo-agent-bench" target="_blank" rel="noreferrer">code</a>.</p>
    </section>

    {shipped.length > 0 && <section className="editorial-section">
      <div className="section-heading"><div><p className="eyebrow">Outside this research</p><h2>Other work shipped</h2></div></div>
      <p className="section-intro">Things I shipped beyond the research above, not commit counts.</p>
      <ol className="activity-list">{shipped.map((item) => <li key={`${item.date}-${item.title}`}>
        <time>{item.date}</time><div><h3>{item.title}</h3><p>{item.summary}</p>
        {item.href && <a href={item.href} target="_blank" rel="noreferrer" aria-label={`Evidence for ${item.title}`}><ExternalLink /></a>}</div>
      </li>)}</ol>
    </section>}

    <ContactSection />
  </PortfolioShell>;
};

export default Index;
