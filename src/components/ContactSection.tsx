import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Check, Copy, Download, Github, Linkedin, Mail } from 'lucide-react';

const email = 'sakethv7@gmail.com';

type CopyState = 'idle' | 'copied' | 'error';

export function ContactSection() {
  const resumeUrl = `${import.meta.env.BASE_URL}Saketh_Velidimalla_Resume.pdf`;
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const resetTimer = useRef<number>();

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const copyEmail = async () => {
    window.clearTimeout(resetTimer.current);
    try {
      await navigator.clipboard.writeText(email);
      setCopyState('copied');
      // The confirmation is transient; a failure stays until the next attempt.
      resetTimer.current = window.setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('error');
    }
  };

  const CopyIcon = copyState === 'copied' ? Check : copyState === 'error' ? AlertCircle : Copy;

  return <section className="editorial-section contact-section" id="contact">
    <div className="section-heading compact"><div><p className="eyebrow">Contact</p><h2>Get in touch</h2></div></div>
    <p className="section-intro">Open to conversations about applied AI systems, evaluation, and edge compute.</p>
    <ul className="contact-channels">
      <li>
        <span className="contact-channel-label">Email</span>
        <a className="contact-channel-value" href={`mailto:${email}`}><Mail aria-hidden="true" />{email}</a>
        <button type="button" className="copy-email" data-state={copyState} onClick={copyEmail} aria-label={`Copy ${email} to the clipboard`}>
          <CopyIcon aria-hidden="true" />
          {copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy failed' : 'Copy'}
        </button>
      </li>
      <li>
        <span className="contact-channel-label">LinkedIn</span>
        <a className="contact-channel-value" href="https://www.linkedin.com/in/sakethvelidimalla/" target="_blank" rel="noreferrer"><Linkedin aria-hidden="true" />linkedin.com/in/sakethvelidimalla</a>
      </li>
      <li>
        <span className="contact-channel-label">GitHub</span>
        <a className="contact-channel-value" href="https://github.com/Sakethv7" target="_blank" rel="noreferrer"><Github aria-hidden="true" />github.com/Sakethv7</a>
      </li>
      <li>
        <span className="contact-channel-label">Résumé</span>
        <a className="contact-channel-value" href={resumeUrl} download="Saketh_Velidimalla_Resume.pdf"><Download aria-hidden="true" />Saketh_Velidimalla_Resume.pdf</a>
      </li>
    </ul>
    <p aria-live="polite" className="contact-status">
      {copyState === 'copied' ? 'Email address copied to the clipboard.' : copyState === 'error' ? 'Could not reach the clipboard. The address above can be selected and copied manually.' : ''}
    </p>
  </section>;
}
