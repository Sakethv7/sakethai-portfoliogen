import { ExternalLink, Github } from 'lucide-react';
import { Button } from './ui/button';

interface Project {
  name: string;
  description: string;
  architecture: string[];
  problems: string[];
  github: string;
  demo?: string;
  tags: string[];
  language: string;
}

const projects: Project[] = [
  {
    name: 'roastrank_CV',
    description: 'LLM evaluation and benchmarking platform. Compares model outputs across accuracy, relevance, hallucination risk, and ranking quality using automated pipelines.',
    architecture: [
      'User Input → Model Responses',
      '→ Evaluation Layer (LLM-as-Judge)',
      '→ Scoring & Ranking',
      '→ Dashboard',
      '↓ Ground Truth Dataset',
      '↓ Regression Testing Suite',
    ],
    problems: [
      'Hallucination: automated detection via judge pipeline',
      'Manual QA overhead: replaced with regression suite',
      'Multi-model comparison: unified scoring framework',
    ],
    github: 'https://github.com/Sakethv7/roastrank_CV',
    demo: 'https://huggingface.co/spaces/Sakethv7/roastrank_CV',
    tags: ['LLM Evals', 'LLM-as-Judge', 'FastAPI', 'Redis', 'Regression Testing'],
    language: 'Python',
  },
  {
    name: 'SDLC Intelligence Agent',
    description: 'Multi-agent PR intelligence system. Analyzes pull requests, detects risky code changes, maps CI/CD failures to impacted files, and generates actionable debugging recommendations.',
    architecture: [
      'GitHub PR → Code Analyzer Agent',
      '→ Failure Detection Agent',
      '→ Debugging Agent',
      '→ Recommendations',
      '↓ Tool Use: CI/CD logs, code diff, file map',
    ],
    problems: [
      'PR review friction: automated risk detection',
      'CI/CD failures: mapped to root cause files',
      'Slow debugging: structured agent recommendations',
    ],
    github: 'https://github.com/Sakethv7/SDLC-Intelligence-Agent',
    tags: ['LangGraph', 'Multi-Agent', 'Tool Use', 'CI/CD', 'GitLab'],
    language: 'Python',
  },
  {
    name: 'SakethWiki',
    description: 'Personal AI knowledge system. Combines RAG, graph-based memory, and entity extraction to synthesize insights across notes, projects, resumes, and research.',
    architecture: [
      'Documents → Chunking → Embeddings',
      '→ Vector DB → Retrieval',
      '→ LLM → Response',
      '↑ Graph Memory + Entity Extraction',
      '↑ Cross-document reasoning layer',
    ],
    problems: [
      'Knowledge fragmentation: unified retrieval across all sources',
      'Context loss: graph memory preserves entity relationships',
      'Shallow search: semantic retrieval + entity linking',
    ],
    github: 'https://github.com/Sakethv7/SakethWiki',
    tags: ['RAG', 'Graph Memory', 'Semantic Search', 'Entity Extraction'],
    language: 'Python',
  },
  {
    name: 'Buddy — Agentic AI Assistant',
    description: 'Agentic AI assistant with RAG, memory, and tool use. Designed for multi-step reasoning, not just chat — combines retrieval, contextual memory, and decision-making.',
    architecture: [
      'User Query → Intent Router',
      '→ Retriever → Memory Layer',
      '→ Tool Use (search, APIs)',
      '→ LLM → Response',
      '↓ Modular agent design',
    ],
    problems: [
      'Single-turn limits: multi-step reasoning workflows',
      'Stateless responses: persistent memory layer',
      'Tool gaps: extensible tool use (search, retrieval, APIs)',
    ],
    github: 'https://github.com/Sakethv7/Buddy',
    tags: ['Agentic AI', 'RAG', 'Memory', 'Tool Use', 'Multi-Step Reasoning'],
    language: 'Python',
  },
];

const getLanguageColor = (language: string) => {
  const colors: { [key: string]: string } = {
    Python: 'text-blue-400',
    TypeScript: 'text-blue-500',
  };
  return colors[language] || 'text-gray-400';
};

const Projects = () => {
  return (
    <section id="projects" className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
          <span className="gradient-text">AI Systems Built</span>
        </h2>
        <p className="text-center text-muted-foreground mb-12 text-base">
          Architecture · Problems solved · Systems thinking
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <div
              key={project.name}
              className="glass p-6 rounded-2xl hover:scale-[1.02] transition-all animate-fade-in hover:border-primary/50 flex flex-col"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-bold text-primary leading-tight">{project.name}</h3>
                <Github className="w-5 h-5 text-muted-foreground shrink-0 ml-2" />
              </div>

              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{project.description}</p>

              {/* Architecture flow */}
              <div className="bg-black/30 rounded-xl p-4 mb-4 font-mono text-xs space-y-0.5">
                <p className="text-muted-foreground uppercase tracking-widest text-[10px] mb-2">Architecture</p>
                {project.architecture.map((line, i) => (
                  <p key={i} className={line.startsWith('↓') || line.startsWith('↑') ? 'text-accent' : 'text-primary/80'}>
                    {line}
                  </p>
                ))}
              </div>

              {/* Problems solved */}
              <div className="mb-4 flex-1">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Problems Solved</p>
                <ul className="space-y-1">
                  {project.problems.map((p, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-accent mt-0.5 shrink-0">▸</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 mb-4">
                <span className={`flex items-center gap-1 text-xs ${getLanguageColor(project.language)}`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-current" />
                  {project.language}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-primary/30 hover:bg-primary/10"
                  onClick={() => window.open(project.github, '_blank')}
                >
                  <Github className="w-4 h-4 mr-2" />
                  Code
                </Button>
                {project.demo && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-accent/30 hover:bg-accent/10"
                    onClick={() => window.open(project.demo, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Demo
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            variant="outline"
            className="border-primary/30 hover:bg-primary/10"
            onClick={() => window.open('https://github.com/Sakethv7', '_blank')}
          >
            <Github className="w-5 h-5 mr-2" />
            View All Projects on GitHub
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Projects;
