import { ArrowRight, ExternalLink, Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PortfolioShell } from '@/components/PortfolioShell';
import { ContactSection } from '@/components/ContactSection';
import { activity, publications, work } from '@/data/portfolio';
import { experiences } from '@/data/experience';

const Index = () => {
  const featured = work.filter((item) => item.featured).slice(0, 3);
  return <PortfolioShell>
    <section className="hero editorial-section">
      <p className="eyebrow">Applied AI Systems Engineer</p>
      <h1>Saketh Velidimalla</h1>
      <p className="hero-thesis">I build observable and reliable AI systems—from retrieval, evaluation, and agent workflows toward intelligent industrial machines and edge compute.</p>
      <div className="hero-links">
        <Link className="primary-link" to="/work">Explore the work <ArrowRight /></Link>
        <a href={`${import.meta.env.BASE_URL}Saketh_Velidimalla_Resume.pdf`} download="Saketh_Velidimalla_Resume.pdf">Download résumé</a>
        <a href="https://github.com/Sakethv7" target="_blank" rel="noreferrer">GitHub</a>
        {/* Scrolls rather than navigating: under HashRouter a bare #contact would be read as a route. */}
        <a href="#contact" onClick={(event) => { event.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}>Contact</a>
      </div>
      <p className="current-line"><span>Current thesis</span> Stack to silicon: connecting production AI reliability with industrial systems, edge inference, and compute.</p>
    </section>

    <section className="editorial-section experience-preview">
      <div className="section-heading">
        <div><p className="eyebrow">Experience</p><h2>Production systems, end to end</h2></div>
        <Link to="/experience">View the chronology <ArrowRight /></Link>
      </div>
      <div className="experience-preview-list">
        {experiences.slice(0, 3).map((item) => <article key={item.id}>
          <time>{item.period}</time><div><h3>{item.title}</h3><p>{item.company}</p></div>
        </article>)}
      </div>
    </section>

    <section className="editorial-section">
      <div className="section-heading">
        <div><p className="eyebrow">Selected work</p><h2>Systems with depth</h2></div>
        <Link to="/work">View the full archive <ArrowRight /></Link>
      </div>
      <div className="featured-grid">
        {featured.map((item, index) => <article className="featured-card" key={item.slug}>
          <p className="item-index">0{index + 1}</p><h3>{item.title}</h3><p>{item.summary}</p>
          <div className="tag-row">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          <div className="card-links">
            {item.github && <a href={item.github} target="_blank" rel="noreferrer"><Github /> Repository</a>}
            {item.private && <span className="private-label">Private / case study forthcoming</span>}
          </div>
        </article>)}
      </div>
    </section>

    <section className="editorial-section two-column-section">
      <div>
        <div className="section-heading compact"><div><p className="eyebrow">Publishing system</p><h2>Writing & research</h2></div></div>
        <p className="section-intro">The public research record starts honestly: planned work is visible as planned, and published work will carry evidence.</p>
        <div className="publication-list">{publications.map((item) => <article key={item.title}>
          <div className="meta-line"><span>{item.kind}</span><span>{item.status}</span></div>
          <h3>{item.title}</h3><p>{item.summary}</p>
        </article>)}</div>
        <div className="inline-links"><Link to="/writing">Writing <ArrowRight /></Link><Link to="/research">Research <ArrowRight /></Link></div>
      </div>
      <aside className="activity-panel">
        <p className="eyebrow">Recent activity</p><h2>Meaningful momentum</h2><p className="activity-note">Releases and artifacts—not commit streaks.</p>
        <ol className="activity-list">{activity.map((item) => <li key={`${item.date}-${item.title}`}>
          <time>{item.date}</time><div><h3>{item.title}</h3><p>{item.summary}</p>
          {item.href && <a href={item.href} target="_blank" rel="noreferrer" aria-label={`Evidence for ${item.title}`}><ExternalLink /></a>}</div>
        </li>)}</ol>
      </aside>
    </section>

    <ContactSection />
  </PortfolioShell>;
};

export default Index;
