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
    name: 'SDLC Intelligence Agent',
    description: 'Enterprise PR intelligence system using LangGraph agents to analyze pull requests, detect risky code changes, summarize CI/CD failures, map errors to impacted files, and generate actionable reviewer/debugging recommendations.',
    details: [
      'Multi-agent orchestration with LangGraph for end-to-end PR analysis',
      'Detects risky code changes and maps CI/CD failures to impacted files',
      'Generates actionable reviewer and debugging recommendations',
      'Deployed via GitLab-integrated workflows',
    ],
    github: 'https://github.com/Sakethv7/SDLC-Intelligence-Agent',
    tags: ['LangGraph', 'Multi-Agent', 'CI/CD', 'GitLab', 'Python'],
    language: 'Python',
  },
  {
    name: 'roastrank_CV',
    description: 'LLM evaluation and benchmarking platform with FastAPI backend, Redis caching, model comparison workflows, ground-truth datasets, regression testing, and visual quality metrics.',
    details: [
      'Compares LLM outputs across accuracy, relevance, hallucination risk, and ranking quality',
      'FastAPI backend with Redis caching for performant eval pipelines',
      'Regression testing against ground-truth datasets',
      'Deployed on Hugging Face infrastructure',
    ],
    github: 'https://github.com/Sakethv7/roastrank_CV',
    demo: 'https://huggingface.co/spaces/Sakethv7/roastrank_CV',
    tags: ['FastAPI', 'LLM Evals', 'Redis', 'Regression Testing', 'Hugging Face'],
    language: 'Python',
  },
  {
    name: 'SakethWiki',
    description: 'Personal AI second-brain system grounded in user-owned knowledge, combining document ingestion, semantic search, graph-based memory, entity extraction, and retrieval-augmented Q&A.',
    details: [
      'RAG pipeline over personal notes, projects, resumes, career plans, and research',
      'Graph-based memory with entity extraction for cross-document synthesis',
      'Semantic search + retrieval-augmented Q&A',
      'Synthesizes insights across personal knowledge base',
    ],
    github: 'https://github.com/Sakethv7/SakethWiki',
    tags: ['RAG', 'Semantic Search', 'Graph Memory', 'Entity Extraction', 'Python'],
    language: 'Python',
  },
  {
    name: "Director's Lab",
    description: "Multimodal AI directing agent — pitch a scene via text, voice, or image to generate a full cinematic storyboard with Gemini-written panels, AI image generation, ambient audio, character dialogue, and a 15-second cinematic clip.",
    details: [
      'Multimodal input: text, voice, or image scene pitches',
      'Gemini-powered storyboard panel writing with AI image generation',
      'Ambient audio synthesis and character dialogue generation',
      'Produces 15-second cinematic clips — deployed on Vercel + Google AI Studio',
    ],
    github: 'https://github.com/Sakethv7/Directors-Lab',
    tags: ['Gemini', 'Multimodal AI', 'Storyboard', 'Vercel', 'Google AI Studio'],
    language: 'TypeScript',
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
