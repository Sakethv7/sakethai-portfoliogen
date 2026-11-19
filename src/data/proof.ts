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
  // Approved by Saketh 2026-11-19 (ADR-055). The 10 percentage point result is confirmed. The 140,000 figure lives in the hero only.
  return { id: 'production', claim: 'I build the data pipelines, reports and KPIs behind a production RAG platform, and I trace why it gives wrong answers.', evidence: 'Glue jobs move DynamoDB data into S3 as Parquet files for Power BI. I build the reports, set KPIs with the business and own the stakeholder relationship. One round of fixes raised self-service resolution by 10 percentage points.', linkLabel: 'Read the case study', to: `/experience/${role.caseStudy.slug}` };
}

function researchCard(): ProofCard | null {
  const chapters = publications.filter((item) => item.series === 'GEO agent benchmark' && item.status === 'Published');
  if (chapters.length === 0 || !work.some((item) => item.slug === 'geo-agent-bench')) return missing('research');
  // One security finding, from FINDINGS.md finding 5 (ADR-055). The featured card owns the other results.
  return { id: 'research', claim: 'I built test websites to see how AI agents behave when a page tries to steer them.', evidence: `A spoofed agent with a valid sign-in token still read a protected page · ${chapters.length} notes with public code`, linkLabel: 'See the project and results', to: '/work/geo-agent-bench' };
}

function appCard(): ProofCard | null {
  const app = work.find((item) => item.slug === 'sakethwiki');
  if (!app?.github) return missing('app');
  return {
    id: 'app', claim: 'My notes app suggests edits but asks before it changes a saved note.', evidence: `An AI correction cannot silently overwrite the source. SakethWiki, ${(app.evidenceStatus ?? 'Public prototype').toLowerCase()}`,
    linkLabel: 'See the code', href: app.github,
    image: { src: `${import.meta.env.BASE_URL}proof/sakethwiki.webp`, alt: 'SakethWiki chat answering a question with cited notes from the knowledge base', width: 800, height: 476 },
  };
}

export const heroProof: ProofCard[] = [productionCard(), researchCard(), appCard()].filter((card): card is ProofCard => card !== null);

// The home row for the current role. It replaces caseStudy.plain on home so the 140,000 figure does not repeat (ADR-055).
export const homeRoleLine = 'I build the pipelines, KPIs and failure triage behind a production RAG platform.';

// The stack ladder on home (ADR-054). Top rung is depth today, bottom rung is what I am learning.
// tests/home-thread.test.mjs checks that every `to` points to a published record.
export interface StackRung {
  layer: 'Product' | 'Agents' | 'Models' | 'Runtimes' | 'Network' | 'Hardware';
  work: string; // 8 words or fewer
  to?: string; // absent means nothing is published yet
  mark?: 'depth today' | 'learning';
}

export const stackLadder: StackRung[] = [
  { layer: 'Product', work: 'Production RAG evaluation and data', to: '/experience/enterprise-ai-quality', mark: 'depth today' },
  { layer: 'Agents', work: 'GEO agent benchmark, MCP tools', to: '/work/geo-agent-bench' },
  { layer: 'Models', work: 'System 1 decision models', to: '/writing/system-one-guard-for-rag' },
  { layer: 'Runtimes', work: 'Ollama against MLX, chip counters', to: '/writing/ollama-vs-mlx-benchmark' },
  { layer: 'Network', work: 'DNS, Web Bot Auth, OAuth', to: '/writing/geo-agent-bench-setup' },
  { layer: 'Hardware', work: 'ESP32, Arduino', mark: 'learning' },
];
