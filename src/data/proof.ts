import { publications, work } from '@/data/portfolio';
import { experiences } from '@/data/experience';

// Hero proof cards (ADR-031, ADR-032). Each card is built from an existing record and is dropped if that record is missing.
export interface ProofCard {
  id: 'production' | 'research' | 'app';
  claim: string;
  evidence: string;
  linkLabel: string;
  to?: string;
  href?: string;
  image?: { src: string; alt: string; width: number; height: number };
}

function missing(id: ProofCard['id']): null {
  if (import.meta.env.DEV) console.warn(`heroProof: missing ${id} source`);
  return null;
}

function productionCard(): ProofCard | null {
  const role = experiences.find((item) => item.caseStudy?.slug === 'enterprise-ai-quality');
  if (!role?.caseStudy) return missing('production');
  // The 140,000 figure must match the published résumé.
  return { id: 'production', claim: 'I work on evals, observability, red-teaming, guardrails, and data and vector schemas for a production RAG platform', evidence: 'The platform serves about 140,000 employees', linkLabel: 'Read the case study', to: `/experience/${role.caseStudy.slug}` };
}

function researchCard(): ProofCard | null {
  const chapters = publications.filter((item) => item.series === 'GEO agent benchmark' && item.status === 'Published');
  if (chapters.length === 0 || !work.some((item) => item.slug === 'geo-agent-bench')) return missing('research');
  return { id: 'research', claim: 'A benchmark of how AI agents behave on a test website: formats, identity and sign-in', evidence: `GEO agent benchmark: ${chapters.length} notes, public code, exact ground truth`, linkLabel: 'Read the overview', to: '/work/geo-agent-bench' };
}

function appCard(): ProofCard | null {
  const app = work.find((item) => item.slug === 'sakethwiki');
  if (!app?.github) return missing('app');
  return {
    id: 'app', claim: 'A knowledge app I use daily: capture, chat, review, browse', evidence: `SakethWiki, ${(app.evidenceStatus ?? 'Public prototype').toLowerCase()}`,
    linkLabel: 'See the code', href: app.github,
    image: { src: `${import.meta.env.BASE_URL}proof/sakethwiki.webp`, alt: 'SakethWiki chat answering a question with cited notes from the knowledge base', width: 800, height: 476 },
  };
}

export const heroProof: ProofCard[] = [productionCard(), researchCard(), appCard()].filter((card): card is ProofCard => card !== null);
