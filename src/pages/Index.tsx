import { ArrowRight, ExternalLink, Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PortfolioShell } from '@/components/PortfolioShell';
import { ContactSection } from '@/components/ContactSection';
import { activity, work } from '@/data/portfolio';
import { heroProof } from '@/data/proof';
import { resumeExperiences } from '@/data/experience';

const Index = () => {
  const featured = work.filter((item) => item.featured).slice(0, 3);
  return <PortfolioShell>
    <section className={`hero editorial-section${heroProof.length > 0 ? ' hero-grid' : ''}`}>
      <div className="hero-copy">
        <p className="eyebrow">Applied AI Systems Engineer</p>
        <h1>Saketh Velidimalla</h1>
        <p className="hero-thesis">I engineer evaluation, observability, guardrails and red-teaming for production RAG systems. I trace failures to retrieval, ranking, generation or handoff. I design the database and vector schemas, and the data pipelines that feed them. I work with leadership to define the KPIs, set quarterly goals against them, and triage what misses them. Today I do this on a RAG platform used by about 140,000 employees.</p>
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
          <time>{item.period}</time><div><h3>{item.title}</h3><p>{item.company}</p></div>
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

    {/* Writing & research block hidden until the first post ships; publications data and routes remain. */}
    <section className="editorial-section">
      <div className="section-heading"><div><p className="eyebrow">Recent activity</p><h2>Recent releases</h2></div></div>
      <p className="section-intro">Things I shipped, not commit counts.</p>
      <ol className="activity-list">{activity.map((item) => <li key={`${item.date}-${item.title}`}>
        <time>{item.date}</time><div><h3>{item.title}</h3><p>{item.summary}</p>
        {item.href && <a href={item.href} target="_blank" rel="noreferrer" aria-label={`Evidence for ${item.title}`}><ExternalLink /></a>}</div>
      </li>)}</ol>
    </section>

    <ContactSection />
  </PortfolioShell>;
};

export default Index;
