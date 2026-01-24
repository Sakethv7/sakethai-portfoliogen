import { useEffect, useState } from 'react';
import { ExternalLink, Github, Star, GitFork, Building } from 'lucide-react';
import { Button } from './ui/button';

interface Project {
  id: number;
  name: string;
  description: string;
  html_url: string;
  homepage: string;
  language: string;
  topics: string[];
  stargazers_count?: number;
  forks_count?: number;
  isWork?: boolean;
  impact?: string;
}

const Projects = () => {
  const [repos, setRepos] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Featured projects - work and personal
  const featuredProjects: Project[] = [
    {
      id: 1,
      name: 'JAIDA RAG Platform',
      description: 'Enterprise conversational AI platform at J&J serving 140K+ employees with 10K-25K monthly queries. Built with Qdrant vector DB, Claude/OpenAI APIs, and advanced retrieval pipelines.',
      html_url: '#',
      homepage: '',
      language: 'Python',
      topics: ['rag', 'qdrant', 'claude-api', 'langchain'],
      isWork: true,
      impact: '140K+ users',
    },
    {
      id: 2,
      name: 'Contract Intelligence',
      description: 'Automated contract analysis using MCP-based agent routing and parameter-efficient fine-tuning. Extracts key clauses, identifies risks, and provides intelligent summaries.',
      html_url: '#',
      homepage: '',
      language: 'Python',
      topics: ['llm', 'mcp', 'fine-tuning', 'nlp'],
      isWork: true,
      impact: 'Production',
    },
    {
      id: 3,
      name: 'RoastRank',
      description: 'AI-powered coffee recommendation app using machine learning to match user preferences with optimal roasts based on flavor profiles and brewing methods.',
      html_url: 'https://github.com/Sakethv7/RoastRank',
      homepage: '',
      language: 'Python',
      topics: ['ml', 'recommendations', 'flask'],
      isWork: false,
    },
  ];

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch('https://api.github.com/users/Sakethv7/repos?sort=updated&per_page=6');
        const data = await response.json();

        const filteredRepos = data
          .filter((repo: Project) => !repo.name.includes('Sakethv7') && !repo.name.includes('portfoliogen'))
          .sort((a: Project, b: Project) => (b.topics?.length || 0) - (a.topics?.length || 0))
          .slice(0, 3);

        setRepos(filteredRepos);
      } catch (error) {
        console.error('Error fetching repos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      Python: 'text-blue-400',
      JavaScript: 'text-yellow-400',
      TypeScript: 'text-blue-500',
      Java: 'text-orange-400',
      HTML: 'text-red-400',
      CSS: 'text-purple-400',
      'Jupyter Notebook': 'text-orange-500',
    };
    return colors[language] || 'text-gray-400';
  };

  const displayProjects = [...featuredProjects, ...repos].slice(0, 6);

  return (
    <section id="projects" className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
          <span className="gradient-text">Featured Projects</span>
        </h2>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass p-6 rounded-2xl animate-pulse">
                <div className="h-6 bg-muted rounded mb-3" />
                <div className="h-4 bg-muted rounded mb-4" />
                <div className="h-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProjects.map((repo, index) => (
              <div
                key={repo.id}
                className="glass p-6 rounded-2xl hover:scale-[1.02] transition-all animate-fade-in hover:border-primary/50"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-primary line-clamp-1">
                    {repo.name.replace(/-/g, ' ')}
                  </h3>
                  <Github className="w-5 h-5 text-muted-foreground" />
                </div>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {repo.description || 'Advanced AI/ML project showcasing cutting-edge technologies and best practices.'}
                </p>

                {/* Tech stack */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(repo.topics || ['ai', 'machine-learning']).slice(0, 4).map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4">
                  {repo.language && (
                    <span className={`flex items-center gap-1 text-sm ${getLanguageColor(repo.language)}`}>
                      <span className="w-3 h-3 rounded-full bg-current" />
                      {repo.language}
                    </span>
                  )}
                  {repo.isWork ? (
                    <span className="flex items-center gap-1 text-sm text-accent">
                      <Building className="w-4 h-4" />
                      {repo.impact}
                    </span>
                  ) : (
                    <>
                      {repo.stargazers_count !== undefined && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="w-4 h-4" />
                          {repo.stargazers_count}
                        </span>
                      )}
                      {repo.forks_count !== undefined && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <GitFork className="w-4 h-4" />
                          {repo.forks_count}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {repo.isWork ? (
                    <span className="flex-1 text-center text-xs text-muted-foreground py-2 px-3 border border-border/50 rounded-md">
                      <Building className="w-4 h-4 inline mr-1" />
                      Enterprise Project
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-primary/30 hover:bg-primary/10"
                      onClick={() => window.open(repo.html_url, '_blank')}
                    >
                      <Github className="w-4 h-4 mr-2" />
                      Code
                    </Button>
                  )}
                  {repo.homepage && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-accent/30 hover:bg-accent/10"
                      onClick={() => window.open(repo.homepage, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Demo
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

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