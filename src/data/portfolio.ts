export type WorkCategory = 'Flagship systems' | 'Developer tools' | 'Experiments & learning' | 'Creative builds';

export interface WorkItem {
  slug: string; title: string; summary: string; category: WorkCategory; tags: string[];
  github?: string; demo?: string; private?: boolean; featured?: boolean; updated?: string;
}

export interface PublicationItem {
  title: string; kind: 'Engineering note' | 'Research note' | 'Build log';
  status: 'Planned' | 'In progress' | 'Published'; summary: string;
}

export interface ActivityItem { date: string; title: string; summary: string; href?: string; }

export const work: WorkItem[] = [
  { slug: 'jaida-production-ai', title: 'JAIDA — Production AI quality systems', summary: 'Evaluation, observability, failure triage, and cross-system analytics for an enterprise RAG assistant serving approximately 140,000 internal users.', category: 'Flagship systems', tags: ['LLMOps', 'RAG evaluation', 'Observability'], private: true, featured: true },
  { slug: 'sakethwiki', title: 'SakethWiki', summary: 'A curation-first personal knowledge system combining ingestion, retrieval memory, trace-driven evaluation, and review-gated knowledge evolution.', category: 'Flagship systems', tags: ['RAG', 'Memory', 'Evaluation'], github: 'https://github.com/Sakethv7/SakethWiki', featured: true, updated: '2026-08-11' },
  { slug: 'lekhni', title: 'Lekhni', summary: 'A local-first recording-to-transcript-to-notes system with model traces, session history, and safeguards for long technical conversations.', category: 'Flagship systems', tags: ['Local-first AI', 'Transcription', 'Knowledge workflow'], private: true, featured: true, updated: '2026-08-11' },
  { slug: 'sdlc-intelligence-agent', title: 'SDLC Intelligence Agent', summary: 'A GitLab-native multi-agent system that analyzes changes, connects delivery failures to impacted files, and produces debugging guidance.', category: 'Developer tools', tags: ['Agents', 'GitLab', 'CI/CD'], github: 'https://github.com/Sakethv7/SDLC-Intelligence-Agent', updated: '2026-03-25' },
  { slug: 'agent-skills', title: 'Agent Skills', summary: 'Reusable agent skills for document reading, OCR, paper digests, contracts, receipts, whiteboards, and slide decks.', category: 'Developer tools', tags: ['Agents', 'Skills', 'Documents'], github: 'https://github.com/Sakethv7/agent-skills', updated: '2026-05-22' },
  { slug: 'agent-mcps', title: 'Agent MCPs', summary: 'MCP servers for document processing, notebooks, source control, and data tooling.', category: 'Developer tools', tags: ['MCP', 'Developer tools', 'Python'], github: 'https://github.com/Sakethv7/agent-mcps', updated: '2026-05-22' },
  { slug: 'leetcode-coach', title: 'LeetCode Coach Extension', summary: 'A browser extension that visualizes data-structure problems and nudges learners toward a solution without giving it away.', category: 'Developer tools', tags: ['Browser extension', 'Learning', 'JavaScript'], github: 'https://github.com/Sakethv7/Leetcode-coach-extension', updated: '2026-03-02' },
  { slug: 'buddy', title: 'Buddy', summary: 'A local AI companion with themed personas, mode-based model routing, memory, and a Socratic interaction style.', category: 'Developer tools', tags: ['Local AI', 'Routing', 'Agents'], github: 'https://github.com/Sakethv7/buddy', updated: '2026-05-03' },
  { slug: 'flashnote', title: 'FlashNote', summary: 'A lightweight notes application linked to a local Obsidian workspace.', category: 'Developer tools', tags: ['Notes', 'Obsidian', 'JavaScript'], github: 'https://github.com/Sakethv7/FlashNote', updated: '2026-04-01' },
  { slug: 'rag-mini', title: 'RAG Mini', summary: 'A FastAPI and React document Q&A stack with local or Gemini embeddings and pluggable NumPy or Qdrant retrieval.', category: 'Experiments & learning', tags: ['RAG', 'FastAPI', 'Qdrant'], github: 'https://github.com/Sakethv7/RAG_mini-phase-2', demo: 'https://rag-ui-frontend.onrender.com/', updated: '2025-12-29' },
  { slug: 'roastrank', title: 'RoastRank', summary: 'A resume-evaluation experiment using an LLM judge, FastAPI, Redis-backed scoring, and a public leaderboard.', category: 'Experiments & learning', tags: ['LLM evaluation', 'FastAPI', 'Redis'], github: 'https://github.com/Sakethv7/roastrank_CV', demo: 'https://huggingface.co/spaces/Wanderingcoder/RoastRank', updated: '2025-12-23' },
  { slug: 'llm-vs-rag', title: 'LLM vs. RAG Similarity', summary: 'An experiment comparing answer similarity and accuracy between small retrieval-augmented and non-retrieval systems.', category: 'Experiments & learning', tags: ['RAG', 'Evaluation', 'NLP'], github: 'https://github.com/Sakethv7/llm_vs_rag_similarity', updated: '2025-12-23' },
  { slug: 'classical-ml-lab', title: 'Classical ML Algorithms Lab', summary: 'Code and visual explanations for classical machine-learning algorithms.', category: 'Experiments & learning', tags: ['Machine learning', 'Visualization', 'Python'], github: 'https://github.com/Sakethv7/classical_ml_algorithms_lab', updated: '2026-01-15' },
  { slug: 'ml-foundations', title: 'ML Foundations', summary: 'Worked notes and implementations covering regression, assumptions, loss functions, features, weights, and optimization foundations.', category: 'Experiments & learning', tags: ['Mathematics', 'Machine learning', 'Python'], github: 'https://github.com/Sakethv7/Phase-1--ML--Foundations', updated: '2025-12-24' },
  { slug: 'neurons-background', title: 'From Perceptrons to Neural Networks', summary: 'A notebook-based comparison of single-neuron perceptrons and multi-neuron methods.', category: 'Experiments & learning', tags: ['Neural networks', 'Notebook', 'Learning'], github: 'https://github.com/Sakethv7/Phase-3--Neurons-background', updated: '2026-01-20' },
  { slug: 'ai-digest', title: 'AI & Tech Policy Digest', summary: 'A scheduled workflow that summarizes selected AI and technology-policy sources and posts a weekly Slack digest.', category: 'Developer tools', tags: ['Automation', 'Gemini', 'Slack'], github: 'https://github.com/Sakethv7/ai-digest', updated: '2026-01-20' },
  { slug: 'sanskrit-shloka', title: 'Sanskrit Wisdom Digest', summary: 'A weekly Slack recommendation system that combines Panchangam context with a personal verse collection.', category: 'Creative builds', tags: ['Automation', 'Cultural computing', 'Python'], github: 'https://github.com/Sakethv7/Sankrit-shloka-repo', updated: '2026-08-16' },
  { slug: 'saketh-poetry', title: 'Saketh Poetry', summary: 'A web-based personal poetry collection and reading experience.', category: 'Creative builds', tags: ['Writing', 'Web', 'HTML'], github: 'https://github.com/Sakethv7/Saketh-Poetry', updated: '2026-08-16' },
  { slug: 'directors-lab', title: "Director's Lab", summary: 'A creative filmmaking workspace organized around cutting, starting, and directing at 24 frames per second.', category: 'Creative builds', tags: ['Film', 'Creative tools', 'Python'], github: 'https://github.com/Sakethv7/director-s-lab', updated: '2026-03-17' },
];

export const publications: PublicationItem[] = [
  { title: 'Evaluating retrieval failures separately from generation failures', kind: 'Research note', status: 'Planned', summary: 'A proposed failure taxonomy and evaluation design grounded in production RAG quality work.' },
  { title: 'Building a review-gated personal knowledge system', kind: 'Engineering note', status: 'Planned', summary: 'Architecture and lessons from SakethWiki: ingestion, provenance, memory, evaluation, and human review.' },
  { title: 'From recording to durable knowledge with Lekhni', kind: 'Build log', status: 'Planned', summary: 'The local-first pipeline, long-transcript safeguards, traces, and permission boundaries behind Lekhni.' },
];

export const activity: ActivityItem[] = [
  { date: '2026-08-16', title: 'Refined the Saketh Poetry reader', summary: 'Moved the anthology toward a calmer shared reading system.', href: 'https://github.com/Sakethv7/Saketh-Poetry' },
  { date: '2026-08-16', title: 'Updated the Sanskrit Wisdom Digest', summary: 'Continued the scheduled Panchangam-aware verse recommendation workflow.', href: 'https://github.com/Sakethv7/Sankrit-shloka-repo' },
  { date: '2026-08-11', title: 'Advanced SakethWiki', summary: 'Continued work on the evolving, review-gated personal knowledge system.', href: 'https://github.com/Sakethv7/SakethWiki' },
  { date: '2026-05-22', title: 'Published reusable agent tooling', summary: 'Maintained public Agent Skills and MCP server collections for document and development workflows.', href: 'https://github.com/Sakethv7/agent-skills' },
];

export const workCategories: WorkCategory[] = ['Flagship systems', 'Developer tools', 'Experiments & learning', 'Creative builds'];
