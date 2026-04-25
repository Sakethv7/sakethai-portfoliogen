import { ExternalLink, Github } from 'lucide-react';
import { Button } from './ui/button';

interface Project {
  name: string;
  description: string;
  details: string[];
  github: string;
  demo?: string;
  tags: string[];
  language: string;
}

const projects: Project[] = [
  {
    name: 'roastrank_CV',
    description: 'LLM evaluation and benchmarking platform with FastAPI backend, Redis caching, model comparison workflows, ground-truth datasets, regression testing, and visual quality metrics.',
    details: [
      'LLM-as-a-judge evaluation pipelines with automated hallucination detection',
      'Multi-model benchmarking across accuracy, relevance, and ranking quality',
      'FastAPI backend with Redis caching for performant eval pipelines',
      'Regression testing against ground-truth datasets — deployed on Hugging Face',
    ],
    github: 'https://github.com/Sakethv7/roastrank_CV',
    demo: 'https://huggingface.co/spaces/Sakethv7/roastrank_CV',
    tags: ['LLM Evals', 'FastAPI', 'Redis', 'Regression Testing', 'Hugging Face'],
    language: 'Python',
  },
  {
    name: 'SDLC Intelligence Agent',
    description: 'Agentic AI system for PR intelligence — uses LangGraph multi-agent orchestration to analyze pull requests, detect risky code changes, map CI/CD failures to impacted files, and generate debugging recommendations.',
    details: [
      'LangGraph-based multi-agent orchestration with structured reasoning workflows',
      'Tool use for CI/CD log analysis and code change detection',
      'Maps failures to root causes and generates actionable reviewer recommendations',
      'Deployed via GitLab-integrated workflows',
    ],
    github: 'https://github.com/Sakethv7/SDLC-Intelligence-Agent',
    tags: ['LangGraph', 'Multi-Agent', 'Tool Use', 'CI/CD', 'Python'],
    language: 'Python',
  },
  {
    name: 'SakethWiki',
    description: 'Personal AI knowledge system combining RAG, graph-based memory, semantic search, and entity extraction to synthesize insights across notes, projects, resumes, and research.',
    details: [
      'RAG pipeline over personal notes, projects, resumes, career plans, and research',
      'Graph-based memory with entity extraction for cross-document reasoning',
      'Semantic search + retrieval-augmented Q&A',
      'Synthesizes insights and surfaces connections across personal knowledge base',
    ],
    github: 'https://github.com/Sakethv7/SakethWiki',
    tags: ['RAG', 'Graph Memory', 'Semantic Search', 'Entity Extraction', 'Python'],
    language: 'Python',
  },
  {
    name: 'Buddy',
    description: 'Agentic AI assistant with RAG, memory, and tool use — designed for multi-step reasoning, not just chat. Combines retrieval, contextual memory, and decision-making in a modular, extensible architecture.',
    details: [
      'Intent routing → retrieval → memory → tool use → LLM response pipeline',
      'Multi-step reasoning workflows with tool usage (search, retrieval, APIs)',
      'Memory-aware responses with modular agent design',
      'Built for real-world extensibility beyond single-turn chatbots',
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
    JavaScript: 'text-yellow-400',
  };
  return colors[language] || 'text-gray-400';
};

const Projects = () => {
  return (
    <section id="projects" className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
          <span className="gradient-text">Featured Projects</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <div
              key={project.name}
              className="glass p-6 rounded-2xl hover:scale-[1.02] transition-all animate-fade-in hover:border-primary/50 flex flex-col"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-primary leading-tight">{project.name}</h3>
                <Github className="w-5 h-5 text-muted-foreground shrink-0 ml-2" />
              </div>

              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{project.description}</p>

              <ul className="space-y-1.5 mb-4 flex-1">
                {project.details.map((detail, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start">
                    <span className="text-accent mr-2 mt-0.5">▸</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 mb-4">
                <span className={`flex items-center gap-1 text-sm ${getLanguageColor(project.language)}`}>
                  <span className="w-3 h-3 rounded-full bg-current" />
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
