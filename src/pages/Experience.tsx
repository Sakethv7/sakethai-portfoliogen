import { ArrowDown, ArrowUpRight, Download, Linkedin, MapPin } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { PortfolioShell } from '@/components/PortfolioShell';
import { experiences, resumeExperiences } from '@/data/experience';

const linkedinExperienceUrl = 'https://www.linkedin.com/in/sakethvelidimalla/details/experience/';

export default function Experience() {
  const resumeUrl = `${import.meta.env.BASE_URL}Saketh_Velidimalla_Resume.pdf`;
  return <PortfolioShell>
    <header className="page-header editorial-section experience-header">
      <p className="eyebrow">Experience</p>
      <h1>A chronology of applied AI and data systems</h1>
      <p>From marketplace machine learning to hardware telemetry and production enterprise AI quality systems.</p>
      <div className="hero-links">
        <a className="primary-link" href={resumeUrl} download="Saketh_Velidimalla_Resume.pdf"><Download /> Download résumé</a>
        <a href={linkedinExperienceUrl} target="_blank" rel="noreferrer"><Linkedin /> LinkedIn experience</a>
      </div>
    </header>
    <section className="editorial-section neural-timeline" aria-label="Professional experience in reverse chronological order">
      {resumeExperiences.map((item, index) => <article className="experience-node" key={item.id} style={{ '--node-index': index } as CSSProperties}>
        <div className="neural-rail" aria-hidden="true"><span className="neural-dot" />{index < resumeExperiences.length - 1 && <span className="neural-connection"><span /></span>}</div>
        <div className="experience-card">
          <div className="experience-card-head">
            <div><p className="experience-period">{item.period}</p><h2>{item.title}</h2><h3>{item.company}</h3></div>
            <span className="employment-type">{item.employmentType}{item.current ? ' · Current' : ''}</span>
          </div>
          <p className="experience-location"><MapPin /> {item.location} · {item.workMode}</p>
          <p className="experience-summary">{item.summary}</p>
          <ul>{item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
        </div>
        {index < resumeExperiences.length - 1 && <ArrowDown className="timeline-arrow" aria-hidden="true" />}
      </article>)}
    </section>
    <section className="editorial-section experience-cta"><div><p className="eyebrow">Recruiter packet</p><h2>Prefer the one-page version?</h2><p>Download the current résumé with direct links to LinkedIn, GitHub, and this portfolio.</p></div><div className="hero-links"><a className="primary-link" href={resumeUrl} download="Saketh_Velidimalla_Resume.pdf"><Download /> Download résumé</a><Link to="/resume">View it here</Link></div></section>
    <section className="editorial-section full-history" aria-label="Full work history">
      <div className="section-heading">
        <div><p className="eyebrow">Full history</p><h2>Every role, as on LinkedIn</h2></div>
        <a href={linkedinExperienceUrl} target="_blank" rel="noreferrer">Open on LinkedIn <ArrowUpRight /></a>
      </div>
      <div className="experience-preview-list">
        {experiences.map((item) => <article key={item.id}>
          <time>{item.period}</time><div><h3>{item.title}</h3><p>{item.company} · {item.employmentType}</p></div>
        </article>)}
      </div>
    </section>
  </PortfolioShell>;
}
