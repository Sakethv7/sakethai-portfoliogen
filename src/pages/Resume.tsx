import { Download, ExternalLink } from 'lucide-react';
import { PortfolioShell } from '@/components/PortfolioShell';

export default function Resume() {
  const resumeUrl = `${import.meta.env.BASE_URL}Saketh_Velidimalla_Resume.pdf`;
  // Android Chrome cannot render inline PDFs and iOS is unreliable, so narrow viewports get links only.
  const canEmbed = window.matchMedia('(min-width: 768px)').matches;
  const actions = <div className="hero-links">
    <a className="primary-link" href={resumeUrl} download="Saketh_Velidimalla_Resume.pdf"><Download /> Download résumé</a>
    <a href={resumeUrl} target="_blank" rel="noreferrer"><ExternalLink /> Open PDF in a new tab</a>
  </div>;
  return <PortfolioShell>
    <header className="page-header editorial-section resume-header">
      <p className="eyebrow">Résumé</p>
      <h1>One page, current</h1>
      {actions}
    </header>
    <section className="editorial-section resume-viewer" aria-label="Résumé PDF">
      {canEmbed
        ? <object data={resumeUrl} type="application/pdf" className="resume-embed" aria-label="Saketh Velidimalla résumé">
            <p className="resume-fallback">This browser cannot show the PDF inline. Use the links above to open or download it.</p>
          </object>
        : <p className="resume-fallback">PDF previews are unreliable on phones. Open it in your device's viewer or download it with the links above.</p>}
    </section>
  </PortfolioShell>;
}
