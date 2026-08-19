import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Github, Linkedin, Mail } from 'lucide-react';

const links = [['/', 'Home'], ['/work', 'Work'], ['/experience', 'Experience'], ['/writing', 'Writing'], ['/research', 'Research'], ['/notes', 'Notes']];

export function PortfolioShell({ children }: { children: ReactNode }) {
  const resumeUrl = `${import.meta.env.BASE_URL}Saketh_Velidimalla_Resume.pdf`;
  return <div className="site-shell">
    <header className="site-header">
      <NavLink to="/" className="wordmark" aria-label="Saketh Velidimalla home">SV</NavLink>
      <nav className="site-nav" aria-label="Primary navigation">
        {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}
      </nav>
      <a className="resume-link" href={resumeUrl} download="Saketh_Velidimalla_Resume.pdf">Download résumé</a>
    </header>
    <main>{children}</main>
    <footer className="site-footer">
      <p>Building reliable AI systems toward intelligent machines and compute.</p>
      <div className="social-links">
        <a href={resumeUrl} download="Saketh_Velidimalla_Resume.pdf">Résumé</a>
        <a href="https://github.com/Sakethv7" target="_blank" rel="noreferrer" aria-label="GitHub"><Github /></a>
        <a href="https://www.linkedin.com/in/sakethvelidimalla/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin /></a>
        <a href="mailto:sakethv7@gmail.com" aria-label="Email"><Mail /></a>
      </div>
    </footer>
  </div>;
}
